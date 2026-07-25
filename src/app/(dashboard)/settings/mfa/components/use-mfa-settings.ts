"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getMFASetup, enableMFA, disableMFA } from "@/actions/mfa";

export function useMFASettings() {
  const { update } = useSession();
  const router = useRouter();

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState<string | undefined>("");
  const [qrUri, setQrUri] = useState<string | undefined>("");
  const [copied, setCopied] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const copyToClipboard = useCallback(async () => {
    if (!qrUri) return;
    try {
      await navigator.clipboard.writeText(qrUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API may fail in insecure contexts
    }
  }, [qrUri]);

  useEffect(() => {
    async function load() {
      try {
        const result = await getMFASetup();
        setMfaEnabled(result.enabled);
        if (!result.enabled) {
          setSecret(result.secret ?? "");
          setQrUri(result.qrUri ?? "");
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleEnable(e: React.FormEvent) {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyError("");

    try {
      const result = await enableMFA(verifyCode);
      if (result.success) {
        setBackupCodes(result.backupCodes);
        setMfaEnabled(true);
        await update();
      }
    } catch (err: any) {
      setVerifyError(err?.message || "فشل التحقق");
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    setDisableLoading(true);
    setDisableError("");

    try {
      await disableMFA(disablePassword);
      setMfaEnabled(false);
      setSecret("");
      setQrUri("");
      setBackupCodes(null);
      setShowDisableConfirm(false);
      setDisablePassword("");
      await update();
    } catch (err: any) {
      setDisableError(err?.message || "فشل تعطيل التوثيق");
    } finally {
      setDisableLoading(false);
    }
  }

  function handleCancelDisable() {
    setShowDisableConfirm(false);
    setDisablePassword("");
    setDisableError("");
  }

  return {
    mfaEnabled,
    loading,
    secret,
    qrUri,
    copied,
    backupCodes,
    backupCodesSaved,
    verifyCode,
    verifyError,
    verifyLoading,
    disablePassword,
    disableError,
    disableLoading,
    showDisableConfirm,
    setVerifyCode,
    setDisablePassword,
    setShowDisableConfirm,
    setBackupCodesSaved,
    copyToClipboard,
    handleEnable,
    handleDisable,
    handleCancelDisable,
  };
}
