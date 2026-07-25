"use client";

import {
  useMFASettings,
  MFAStatusHeader,
  MFAEnabledCard,
  MFADisableConfirm,
  MFABackupCodes,
  MFASetupForm,
} from "./components";

export default function MFASettingsPage() {
  const {
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
  } = useMFASettings();

  if (loading) {
    return (
      <main className="p-8 max-w-lg mx-auto">
        <p className="text-muted-foreground">جارٍ التحميل...</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-lg mx-auto" dir="rtl">
      <MFAStatusHeader mfaEnabled={mfaEnabled} />

      {mfaEnabled && !showDisableConfirm && (
        <MFAEnabledCard onDisableClick={() => setShowDisableConfirm(true)} />
      )}

      {mfaEnabled && showDisableConfirm && (
        <MFADisableConfirm
          password={disablePassword}
          onPasswordChange={setDisablePassword}
          error={disableError}
          loading={disableLoading}
          onDisable={handleDisable}
          onCancel={handleCancelDisable}
        />
      )}

      {!mfaEnabled && backupCodes && (
        <MFABackupCodes
          codes={backupCodes}
          saved={backupCodesSaved}
          onSaved={() => setBackupCodesSaved(true)}
        />
      )}

      {!mfaEnabled && !backupCodes && (
        <MFASetupForm
          secret={secret}
          qrUri={qrUri}
          copied={copied}
          onCopy={copyToClipboard}
          verifyCode={verifyCode}
          onVerifyCodeChange={setVerifyCode}
          verifyError={verifyError}
          verifyLoading={verifyLoading}
          onVerify={handleEnable}
        />
      )}
    </main>
  );
}
