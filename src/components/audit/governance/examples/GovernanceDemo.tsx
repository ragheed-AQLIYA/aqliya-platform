'use client';

import React from 'react';
import { DraftOnlyBanner } from '../DraftOnlyBanner';
import { ReviewRequiredNotice } from '../ReviewRequiredNotice';
import { EvidenceStatusBadge } from '../EvidenceStatusBadge';
import { EscalationBadge } from '../EscalationBadge';
import { ProvenanceSummary } from '../ProvenanceSummary';
import { GovernanceContextPanel } from '../GovernanceContextPanel';
import type { EvidenceStatus, EscalationLevel } from '../types';

export function GovernanceDemo() {
  const evidenceStatuses: EvidenceStatus[] = ['complete', 'partial', 'missing', 'conflicting', 'weak'];
  const escalationLevels: EscalationLevel[] = ['none', 'notice', 'review_required', 'senior_review_required', 'blocked'];

  return (
    <div className="p-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold">عرض توضيحي لمكونات الحوكمة</h1>

      <section>
        <h2 className="text-lg font-semibold mb-2">شعار المسودة فقط</h2>
        <DraftOnlyBanner taskType="statement_drafting" />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">إشعار المراجعة المطلوبة</h2>
        <ReviewRequiredNotice />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">شارة حالة الدليل — جميع الحالات</h2>
        <div className="flex flex-wrap gap-2">
          {evidenceStatuses.map((status) => (
            <EvidenceStatusBadge key={status} status={status} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">شارة التصعيد — جميع المستويات</h2>
        <div className="flex flex-wrap gap-2">
          {escalationLevels.map((level) => (
            <EscalationBadge key={level} level={level} reason={level === 'blocked' ? 'محاولة تجاوز الاعتماد' : undefined} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">ملخص التتبع (بيانات تجريبية)</h2>
        <ProvenanceSummary
          taskType="صياغة القوائم"
          doctrineCount={3}
          governanceCount={5}
          evidenceStatus="partial"
          escalationLevel="notice"
          reviewRequired={true}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">لوحة سياق الحوكمة (بيانات تجريبية)</h2>
        <GovernanceContextPanel
          taskType="statement_drafting"
          evidenceStatus="partial"
          escalationLevel="review_required"
        />
      </section>
    </div>
  );
}
