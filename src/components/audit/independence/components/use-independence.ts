import { useState, useEffect, useCallback } from "react";
import {
  listRegisterAction,
  registerPersonAction,
  declareFinancialInterestAction,
  declareEmploymentAction,
  identifyThreatAction,
  runConflictCheckAction,
  createConfirmationCycleAction,
  getConfirmationStatusAction,
  getIndependenceDashboardAction,
  getThreatCategoriesAction,
} from "@/actions/audit-independence-actions";

export interface IndependenceState {
  activeTab: string;
  loading: boolean;
  dashboard: any;
  register: any[];
  selectedEntry: any;
  error: string | null;
  success: string | null;
  submitting: boolean;
  newPersonId: string;
  newPersonName: string;
  newPersonRole: string;
  fiRegisterId: string;
  fiType: string;
  fiIssuer: string;
  empRegisterId: string;
  empEntityName: string;
  empType: string;
  empRelationship: string;
  threatRegisterId: string;
  threatCategory: string;
  threatDescription: string;
  threatLevel: string;
  conflictClientName: string;
  conflictResult: any;
  confirmYear: string;
  confirmStatus: any;
  threatCategories: any[];
  orgId: string;
}

export interface IndependenceActions {
  setActiveTab: (tab: string) => void;
  setSelectedEntry: (entry: any | null) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
  setNewPersonId: (id: string) => void;
  setNewPersonName: (name: string) => void;
  setNewPersonRole: (role: string) => void;
  setFiRegisterId: (id: string) => void;
  setFiIssuer: (issuer: string) => void;
  setThreatRegisterId: (id: string) => void;
  setThreatCategory: (cat: string) => void;
  setThreatDescription: (desc: string) => void;
  setThreatLevel: (level: string) => void;
  setConflictClientName: (name: string) => void;
  setConfirmYear: (year: string) => void;
  handleRegisterPerson: () => Promise<void>;
  handleDeclareInterest: (registerId?: string) => Promise<void>;
  handleDeclareEmployment: () => Promise<void>;
  handleIdentifyThreat: () => Promise<void>;
  handleConflictCheck: () => Promise<void>;
  handleCreateConfirmationCycle: () => Promise<void>;
}

export function useIndependence(auditOrganizationId: string): [IndependenceState, IndependenceActions] {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [register, setRegister] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newPersonId, setNewPersonId] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonRole, setNewPersonRole] = useState("staff");

  const [fiRegisterId, setFiRegisterId] = useState("");
  const [fiType, setFiType] = useState("direct_investment");
  const [fiIssuer, setFiIssuer] = useState("");

  const [empRegisterId, setEmpRegisterId] = useState("");
  const [empEntityName, setEmpEntityName] = useState("");
  const [empType, setEmpType] = useState("client");
  const [empRelationship, setEmpRelationship] = useState("family_member");

  const [threatRegisterId, setThreatRegisterId] = useState("");
  const [threatCategory, setThreatCategory] = useState("self_interest");
  const [threatDescription, setThreatDescription] = useState("");
  const [threatLevel, setThreatLevel] = useState("moderate");

  const [conflictClientName, setConflictClientName] = useState("");
  const [conflictResult, setConflictResult] = useState<any>(null);

  const [confirmYear, setConfirmYear] = useState(new Date().getFullYear().toString());
  const [confirmStatus, setConfirmStatus] = useState<any>(null);

  const [threatCategories, setThreatCategories] = useState<any[]>([]);

  const orgId = auditOrganizationId || "org-aqliya";

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, reg, cats] = await Promise.all([
        getIndependenceDashboardAction(orgId),
        listRegisterAction(orgId),
        getThreatCategoriesAction(),
      ]);
      setDashboard(dash);
      setRegister(reg);
      setThreatCategories(cats);
    } catch { /* ignore */ }
    setLoading(false);
  }, [orgId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleRegisterPerson() {
    if (!newPersonId.trim() || !newPersonName.trim()) return;
    setSubmitting(true);
    try {
      await registerPersonAction({
        organizationId: orgId,
        entityId: newPersonId,
        entityName: newPersonName,
        entityRole: newPersonRole,
      });
      setSuccess(`تم تسجيل: ${newPersonName}`);
      setNewPersonId(""); setNewPersonName("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل التسجيل");
    }
    setSubmitting(false);
  }

  async function handleDeclareInterest(overrideRegisterId?: string) {
    const regId = overrideRegisterId || fiRegisterId;
    if (!regId || !fiIssuer) return;
    setSubmitting(true);
    try {
      await declareFinancialInterestAction({ registerId: regId, interestType: fiType, issuerName: fiIssuer });
      setSuccess("تم الإفصاح عن المصلحة المالية");
      setFiIssuer("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الإفصاح");
    }
    setSubmitting(false);
  }

  async function handleDeclareEmployment() {
    if (!empRegisterId || !empEntityName) return;
    setSubmitting(true);
    try {
      await declareEmploymentAction({
        registerId: empRegisterId,
        relatedEntityName: empEntityName,
        relatedEntityType: empType,
        relationshipType: empRelationship,
      });
      setSuccess("تم الإفصاح عن علاقة العمل");
      setEmpEntityName("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الإفصاح");
    }
    setSubmitting(false);
  }

  async function handleIdentifyThreat() {
    if (!threatRegisterId || !threatDescription) return;
    setSubmitting(true);
    try {
      await identifyThreatAction({
        registerId: threatRegisterId,
        threatCategory,
        threatDescription,
        threatLevel,
      });
      setSuccess("تم تسجيل تهديد الاستقلالية");
      setThreatDescription("");
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل تسجيل التهديد");
    }
    setSubmitting(false);
  }

  async function handleConflictCheck() {
    if (!conflictClientName.trim()) return;
    setSubmitting(true);
    try {
      const result = await runConflictCheckAction("", conflictClientName);
      setConflictResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل فحص التعارض");
    }
    setSubmitting(false);
  }

  async function handleCreateConfirmationCycle() {
    setSubmitting(true);
    try {
      const result = await createConfirmationCycleAction(orgId, Number(confirmYear));
      setSuccess(`تم إنشاء ${result.totalConfirmations} تأكيد`);
      const status = await getConfirmationStatusAction(orgId, Number(confirmYear));
      setConfirmStatus(status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إنشاء دورة التأكيد");
    }
    setSubmitting(false);
  }

  const state: IndependenceState = {
    activeTab, loading, dashboard, register, selectedEntry,
    error, success, submitting,
    newPersonId, newPersonName, newPersonRole,
    fiRegisterId, fiType, fiIssuer,
    empRegisterId, empEntityName, empType, empRelationship,
    threatRegisterId, threatCategory, threatDescription, threatLevel,
    conflictClientName, conflictResult,
    confirmYear, confirmStatus,
    threatCategories, orgId,
  };

  const actions: IndependenceActions = {
    setActiveTab, setSelectedEntry, setError, setSuccess,
    setNewPersonId, setNewPersonName, setNewPersonRole,
    setFiRegisterId, setFiIssuer,
    setThreatRegisterId, setThreatCategory, setThreatDescription, setThreatLevel,
    setConflictClientName, setConfirmYear,
    handleRegisterPerson, handleDeclareInterest, handleDeclareEmployment,
    handleIdentifyThreat, handleConflictCheck, handleCreateConfirmationCycle,
  };

  return [state, actions];
}
