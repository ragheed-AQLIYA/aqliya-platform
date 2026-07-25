# AQLIYA Pricing Model
# نموذج تسعير عقلية

**Status:** Active | **Version:** 2.0 | **Date:** 2026-07-25
**Owner:** Commercial Team | **Last Reviewed:** 2026-07-25
**Authority:** Must not contradict `WHAT_WE_DO_NOT_CLAIM.md`. Pricing is illustrative — final quotes are per SOW.
**Supersedes:** `PRICING_MODEL.md` v1.1 (2026-07-19)
**Audience:** Sales, founders, customers

---

## Philosophy — الفلسفة

AQLIYA is sold as an institutional operating platform with **capability tiers**. Each tier unlocks Intelligence Core access, governed product workspaces, users, storage, and support. All prices are in Saudi Riyals (SAR) and exclusive of VAT (15%).

تُباع عقلية كمنصة تشغيل مؤسسية مع **مستويات قدرات**. يفتح كل مستوى الوصول إلى النواة الذكية، ومساحات عمل المنتجات المحكومة، والمستخدمين، والتخزين، والدعم. جميع الأسعار بالريال السعودي وغير شاملة ضريبة القيمة المضافة (15%).

### Commercial Wedges (Pilot) — الروافع التجارية (المرحلة التجريبية)

| Sold in Pilot — يُباع في المرحلة التجريبية | Not Sold in Pilot — لا يُباع |
|-------------------------------------------|------------------------------|
| **AuditOS** XOR **LocalContentOS** (Cloud) | SalesOS (internal workspace) |
| Foundation / Professional / Enterprise | On-Prem / Air-Gapped packages |
| Cloud deployment only | RiskOS / SimulationOS / AQLIYA Studio as standalone products |

---

## Tiers — المستويات

### Tier 1: Starter — البداية
### Tier 1: Starter — البداية

**SAR 2,999/month — 2,999 ريال/شهر**

| Feature — الميزة | Included — متضمن |
|------------------|------------------|
| **Intelligence Core** | Full access — وصول كامل |
| **Product Workspaces** | 1 workspace (AuditOS XOR LocalContentOS) — مساحة عمل واحدة |
| **Users** | Up to 5 named users — حتى 5 مستخدمين |
| **Storage** | 10 GB — 10 جيجابايت |
| **Support** | Email, business hours — بريد إلكتروني، ساعات العمل |
| **Deployment** | AQLIYA Cloud (shared) — عقلية السحابية (مشتركة) |
| **SLA** | Best effort — أفضل جهد |
| **SSO** | Not included — غير متضمن |
| **API Access** | Not included — غير متضمن |

**Best for:** Small teams, single-department pilot, proof of concept.
**مناسبة لـ:** الفرق الصغيرة، تجربة قسم واحد، إثبات المفهوم.

---

### Tier 2: Professional — المهنية
### Tier 2: Professional — المهنية

**SAR 9,999/month — 9,999 ريال/شهر**

| Feature — الميزة | Included — متضمن |
|------------------|------------------|
| **Intelligence Core** | Full access + AI Governance — وصول كامل + حوكمة الذكاء الاصطناعي |
| **Product Workspaces** | Up to 2 workspaces — حتى مساحتي عمل |
| **Users** | Up to 25 named users — حتى 25 مستخدم |
| **Storage** | 100 GB — 100 جيجابايت |
| **Support** | Priority email + phone (P1/P2), business hours — بريد إلكتروني بأولوية + هاتف (للطوارئ)، ساعات العمل |
| **Deployment** | AQLIYA Cloud (dedicated DB) — عقلية السحابية (قاعدة بيانات مخصصة) |
| **SLA** | 99.5% uptime, response times (P1: 4h, P2: 8h) — وقت تشغيل 99.5%، أوقات استجابة |
| **SSO** | SAML/OIDC (operator-configured) — إعداد مشغّل |
| **API Access** | REST API (rate-limited) — API مقيد |
| **Training** | 2 onboarding sessions included — جلستان تدريبيتان |
| **Export** | PDF, XLSX, JSON — متعدد الصيغ |

**Best for:** Mid-sized teams, multi-department deployment, operational use.
**مناسبة لـ:** الفرق المتوسطة، نشر متعدد الأقسام، استخدام تشغيلي.

---

### Tier 3: Enterprise — المؤسسات
### Tier 3: Enterprise — المؤسسات

**Custom pricing — تسعير مخصص**

| Feature — الميزة | Included — متضمن |
|------------------|------------------|
| **Intelligence Core** | Full access + AI Governance + Custom Models — وصول كامل + حوكمة + نماذج مخصصة |
| **Product Workspaces** | Unlimited (per SOW) — غير محدود (حسب نطاق العمل) |
| **Users** | Unlimited (per SOW) — غير محدود |
| **Storage** | Custom (per SOW) — مخصص |
| **Support** | 24/7 P1 phone + dedicated support engineer + named account manager — دعم على مدار الساعة + مهندس دعم مخصص + مدير حساب |
| **Deployment** | AQLIYA Cloud (dedicated instance) or Private Cloud (per SOW/ADR) — عقلية السحابية (مثيل مخصص) أو سحابة خاصة |
| **SLA** | Full SLA: 99.5% uptime + credits + full response/resolution matrix — اتفاقية كاملة |
| **SSO** | SAML/OIDC + SCIM v2 provisioning — مع توفير آلي |
| **API Access** | Full REST API + webhooks — كامل |
| **Custom Integrations** | ERP connectors, custom workflows, data pipelines (per SOW) — موصلات مخصصة |
| **Training** | Full onboarding program + quarterly review — برنامج تدريبي كامل + مراجعة ربع سنوية |
| **On-Prem Option** | Available under separate SOW/ADR (not in standard price book) — متاح بعقد منفصل |
| **Compliance** | SOC2 roadmap + audit support — خارطة طريق + دعم تدقيق |
| **Export** | All formats + custom report templates — جميع الصيغ + قوالب تقارير مخصصة |

**Best for:** Enterprise-wide deployment, multiple departments, regulated industries, institutional-grade requirements.
**مناسبة لـ:** نشر على مستوى المؤسسة، أقسام متعددة، قطاعات منظمة، متطلبات مؤسسية.

---

## Add-ons — الإضافات

Available across all tiers (unless tier-restricted):

متاحة لجميع المستويات (ما لم تكن مقيدة بالمستوى):

| Add-on — الإضافة | Price — السعر | Notes — ملاحظات |
|------------------|---------------|------------------|
| **Additional User Pack (5 users)** | SAR 1,500/month — 1,500 ريال/شهر | Starter/Professional only |
| **Additional Workspace** | SAR 5,000/month — 5,000 ريال/شهر | Beyond tier limit |
| **Additional Storage (100 GB)** | SAR 1,000/month — 1,000 ريال/شهر | |
| **AI Agent Pack** | SAR 3,000/month — 3,000 ريال/شهر | Per additional agent type |
| **Training & Onboarding** | SAR 15,000 one-time — 15,000 ريال (مرة واحدة) | Includes admin + user sessions |
| **Custom Integration** | Scoped per SOW — حسب نطاق العمل | ERP, data pipeline, custom workflow |
| **Data Migration Assistance** | SAR 25,000 one-time — 25,000 ريال (مرة واحدة) | Up to 50 GB; beyond: scoped separately |
| **Dedicated Support Engineer** | SAR 8,000/month — 8,000 ريال/شهر | Enterprise: included |

---

## Pilot Program — برنامج المرحلة التجريبية
## Pilot Program — برنامج المرحلة التجريبية

### Terms — الشروط

| Parameter — المعيار | Value — القيمة |
|--------------------|----------------|
| **Discount — الخصم** | **50%** off listed tier price — خصم 50% من السعر المعلن |
| **Availability — التوفر** | First 3 customers only — أول 3 عملاء فقط |
| **Commitment — الالتزام** | Minimum 3 months — 3 أشهر كحد أدنى |
| **Onboarding** | Included (dedicated engineer) — متضمن (مهندس مخصص) |
| **Money-back** | First month (if offered in SOW) — الشهر الأول (إذا تم تضمينه في العقد) |
| **Tiers eligible — المستويات المؤهلة** | Starter, Professional — البداية والمهنية |

### Pilot Pricing (with 50% discount) — أسعار المرحلة التجريبية (مع خصم 50%)

| Tier — المستوى | Standard — السعر العادي | Pilot — السعر التجريبي |
|----------------|------------------------|------------------------|
| **Starter** | SAR 2,999 — 2,999 ريال | **SAR 1,500 — 1,500 ريال** |
| **Professional** | SAR 9,999 — 9,999 ريال | **SAR 5,000 — 5,000 ريال** |

---

## Annual Commitment — الالتزام السنوي

- Annual contracts receive **2 months free** (when offered in SOW).
- Example: Professional annual = SAR 9,999 × 10 = SAR 99,990/year (effective SAR 8,333/month).

- العقود السنوية تحصل على **شهرين مجاناً** (حين تُقدم في العقد).
- مثال: المهنية السنوية = 9,999 × 10 = 99,990 ريال/سنة (ما يعادل 8,333 ريال/شهر).

---

## Billing — الفوترة

| Parameter — المعيار | Value — القيمة |
|--------------------|----------------|
| **Currency — العملة** | Saudi Riyal (SAR) — الريال السعودي |
| **VAT — الضريبة** | 15% (added to invoice) — تضاف للفاتورة |
| **Billing cycle — دورة الفوترة** | Monthly or annual — شهري أو سنوي |
| **Payment terms — شروط الدفع** | Net 30 days — صافي 30 يوماً |
| **Invoice delivery — تسليم الفاتورة** | Email PDF + portal — بريد إلكتروني + بوابة |

---

## Explicitly Not Sold — غير مباع صراحةً

Per `WHAT_WE_DO_NOT_CLAIM.md` and ADR-108/ADR-109:

| Item — العنصر | Status — الحالة |
|---------------|-----------------|
| On-Prem deployment package — حزمة نشر داخلي | **Not sold** — L0 / strategic future |
| Air-Gapped appliance — جهاز معزول | **Not sold** — L0 / strategic future |
| Private cloud / customer VPC as a standard SKU — سحابة خاصة كمنتج قياسي | **Not sold** until dedicated ADR + delivery package exists |
| SalesOS as customer CRM — SalesOS كـ CRM للعميل | **Not sold** in pilot phase — داخلي فقط |
| RiskOS / SimulationOS / AQLIYA Studio as standalone products | **Not sold** — submodule, redirect, or concept |
| SOC2 certification — شهادة SOC2 | **Roadmap** — not certified today |
| "Production-hardened / L6" unrestricted claims — ادعاءات L6 غير المقيدة | **Suspended** (P0 governance freeze per ADR-109) |

---

## Related Documents — وثائق ذات صلة

| Document | Path |
|----------|------|
| What We Do Not Claim | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` |
| SLA Template | `docs/commercial/SLA_TEMPLATE.md` |
| Client Onboarding | `docs/commercial/CLIENT_ONBOARDING.md` |
| Pilot SOW Template | `docs/commercial/PILOT_SOW_TEMPLATE.md` |
| Product Status Matrix | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` |
| Enterprise Readiness | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` |

---

## Change Log — سجل التغييرات

| Date | Version | Change |
|------|---------|--------|
| 2026-06-30 | 1.0 | Initial draft |
| 2026-07-19 | 1.1 | P0: removed On-Prem +50%; aligned with exclusions |
| 2026-07-25 | 2.0 | Restructured tiers (Starter SAR 2,999 / Professional SAR 9,999 / Enterprise custom); added pilot program detail; bilingual formatting; add-ons table; annual commitment section |

---

*Prices are illustrative. Final pricing is confirmed in the signed Statement of Work. All prices exclude VAT.*
*الأسعار توضيحية. التسعير النهائي يُعتمد في نطاق العمل الموقّع. جميع الأسعار غير شاملة ضريبة القيمة المضافة.*
