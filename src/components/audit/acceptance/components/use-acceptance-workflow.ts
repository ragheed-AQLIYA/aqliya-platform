import { useState, useEffect, useCallback } from "react";
import {
  createProspectAction,
  listProspectsAction,
  getProspectAction,
  submitKycAction,
  assessClientRiskAction,
  makeAcceptanceDecisionAction,
  getPipelineAction,
} from "@/actions/audit-client-acceptance-actions";

export interface KycData {
  regulatoryStatus: string;
  regulatoryBody: string;
  pepCheck: string;
  sanctionCheck: string;
  adverseMediaCheck: string;
  notes: string;
}

export interface RiskFactor {
  name: string;
  weight: number;
  score: number;
  rationale: string;
}

export const DEFAULT_KYC_DATA: KycData = {
  regulatoryStatus: "",
  regulatoryBody: "",
  pepCheck: "pending",
  sanctionCheck: "pending",
  adverseMediaCheck: "pending",
  notes: "",
};

export const DEFAULT_RISK_FACTORS: RiskFactor[] = [
  { name: "entity_risk", weight: 0.25, score: 5, rationale: "" },
  { name: "industry_risk", weight: 0.20, score: 5, rationale: "" },
  { name: "financial_risk", weight: 0.20, score: 5, rationale: "" },
  { name: "governance_risk", weight: 0.15, score: 5, rationale: "" },
  { name: "regulatory_risk", weight: 0.20, score: 5, rationale: "" },
];

export interface AcceptanceState {
  activeTab: string;
  loading: boolean;
  pipeline: any;
  prospects: any[];
  selectedProspect: any;
  error: string | null;
  success: string | null;
  submitting: boolean;
  showNewForm: boolean;
  kycData: KycData;
  riskFactors: RiskFactor[];
  decisionValue: string;
  decisionRationale: string;
  conditions: string[];
  conditionInput: string;
}

export interface AcceptanceActions {
  setActiveTab: (tab: string) => void;
  setError: (err: string | null) => void;
  setSuccess: (msg: string | null) => void;
  setSubmitting: (v: boolean) => void;
  setShowNewForm: (v: boolean) => void;
  setKycData: React.Dispatch<React.SetStateAction<KycData>>;
  setRiskFactors: React.Dispatch<React.SetStateAction<RiskFactor[]>>;
  setDecisionValue: (v: string) => void;
  setDecisionRationale: (v: string) => void;
  setConditions: React.Dispatch<React.SetStateAction<string[]>>;
  setConditionInput: (v: string) => void;
  handleCreateProspect: (form: NewProspectForm) => Promise<void>;
  handleSelectProspect: (id: string) => Promise<void>;
  handleSubmitKyc: () => Promise<void>;
  handleAssessRisk: () => Promise<void>;
  handleMakeDecision: () => Promise<void>;
  loadPipeline: () => Promise<void>;
}

export interface NewProspectForm {
  company: string;
  source: string;
  industry: string;
  contact: string;
  email: string;
  phone: string;
  fee: string;
  referredBy: string;
}

export function useAcceptanceWorkflow(auditOrganizationId: string) {
  const [activeTab, setActiveTab] = useState("pipeline");
  const [loading, setLoading] = useState(true);
  const [pipeline, setPipeline] = useState<any>(null);
  const [prospects, setProspects] = useState<any[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  const [kycData, setKycData] = useState<KycData>(DEFAULT_KYC_DATA);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>(DEFAULT_RISK_FACTORS);

  const [decisionValue, setDecisionValue] = useState("accept");
  const [decisionRationale, setDecisionRationale] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState("");

  const orgId = auditOrganizationId || "org-aqliya";

  const loadPipeline = useCallback(async () => {
    setLoading(true);
    try {
      const [p, pros] = await Promise.all([
        getPipelineAction(orgId),
        listProspectsAction(orgId),
      ]);
      setPipeline(p);
      setProspects(pros);
    } catch { /* ignore */ }
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  async function handleCreateProspect(form: NewProspectForm) {
    if (!form.company.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createProspectAction({
        organizationId: orgId,
        source: form.source,
        companyName: form.company,
        industry: form.industry || undefined,
        contactName: form.contact || undefined,
        contactEmail: form.email || undefined,
        contactPhone: form.phone || undefined,
        estimatedFee: form.fee ? Number(form.fee) : undefined,
        referredBy: form.referredBy || undefined,
      });
      setSuccess(`تم إنشاء عميل محتمل: ${form.company}`);
      setShowNewForm(false);
      await loadPipeline();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إنشاء العميل المحتمل");
    }
    setSubmitting(false);
  }

  async function handleSelectProspect(id: string) {
    try {
      const p = await getProspectAction(id);
      setSelectedProspect(p);
      setActiveTab("detail");
    } catch { /* ignore */ }
  }

  async function handleSubmitKyc() {
    if (!selectedProspect) return;
    setSubmitting(true);
    try {
      await submitKycAction(selectedProspect.id, kycData);
      setSuccess("تم إكمال فحص العناية الواجبة");
      const updated = await getProspectAction(selectedProspect.id);
      setSelectedProspect(updated);
      await loadPipeline();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إرسال KYC");
    }
    setSubmitting(false);
  }

  async function handleAssessRisk() {
    if (!selectedProspect) return;
    setSubmitting(true);
    try {
      await assessClientRiskAction({
        prospectId: selectedProspect.id,
        assessmentType: "acceptance",
        riskFactors,
      });
      setSuccess("تم تقييم المخاطر");
      const updated = await getProspectAction(selectedProspect.id);
      setSelectedProspect(updated);
      await loadPipeline();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تقييم المخاطر");
    }
    setSubmitting(false);
  }

  async function handleMakeDecision() {
    if (!selectedProspect) return;
    setSubmitting(true);
    try {
      await makeAcceptanceDecisionAction({
        prospectId: selectedProspect.id,
        decisionType: "acceptance",
        decision: decisionValue,
        rationale: decisionRationale,
        conditions: conditions.length > 0 ? conditions : undefined,
      });
      setSuccess("تم تسجيل قرار القبول");
      const updated = await getProspectAction(selectedProspect.id);
      setSelectedProspect(updated);
      await loadPipeline();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تسجيل القرار");
    }
    setSubmitting(false);
  }

  const state: AcceptanceState = {
    activeTab, loading, pipeline, prospects, selectedProspect,
    error, success, submitting, showNewForm,
    kycData, riskFactors,
    decisionValue, decisionRationale, conditions, conditionInput,
  };

  const actions: AcceptanceActions = {
    setActiveTab, setError, setSuccess, setSubmitting, setShowNewForm,
    setKycData, setRiskFactors,
    setDecisionValue, setDecisionRationale, setConditions, setConditionInput,
    handleCreateProspect, handleSelectProspect,
    handleSubmitKyc, handleAssessRisk, handleMakeDecision,
    loadPipeline,
  };

  return { state, actions };
}
