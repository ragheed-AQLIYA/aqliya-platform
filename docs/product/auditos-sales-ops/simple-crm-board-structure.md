# AQLIYA AuditOS Simple CRM Board Structure

Source of truth:

1. `docs/product/auditos-product-packaging.md`
2. `docs/product/auditos-outbound-kit/`

## Purpose

هذا الهيكل مخصص لأول CRM board بسيط يدير pipeline الخاصة بـ AuditOS.

## Suggested Columns

1. New Lead
2. Contacted
3. Responded
4. Discovery Scheduled
5. Discovery Completed
6. Qualified
7. Demo Scheduled
8. Demo Completed
9. Pilot Proposed
10. Pilot Active
11. Proposal / Commercial Review
12. Negotiation
13. Won
14. Lost
15. Paused / Nurture

## Minimum Card Fields

كل card يجب أن تحتوي:

1. Account name
2. Contact name
3. Segment
4. Buyer role
5. Main pain
6. Current tools
7. Next step
8. Owner
9. Last contact date
10. Risk note

## Card Tags

استخدم tags بسيطة مثل:

1. Audit firm
2. Accounting office
3. CFO team
4. SME finance
5. High urgency
6. Weak fit
7. Pilot candidate

## Board Rules

1. لا تبقِ card بدون next step
2. كل card يجب أن يكون لها owner واحد فقط
3. إذا لم يوجد رد خلال فترة مناسبة، انقلها إلى nurture أو paused
4. لا تنقل أي فرصة إلى pilot بدون use case واضحة
5. لا تنقل أي فرصة إلى proposal بدون success criteria واضحة

## Weekly Maintenance

كل أسبوع:

1. راجع cards الراكدة
2. نظف statuses غير الدقيقة
3. حدّث next steps
4. أغلق الفرص الميتة بدل تركها مفتوحة بلا معنى
