# AQLIYA — الخطة الاستراتيجية الكاملة
## من Pilot-Ready إلى Production-Grade

**التاريخ:** 2026-07-25
**الحالة الحالية:** Pilot-Ready (79/100 — CONDITIONAL GO)
**الهدف:** Production-Grade (95+/100 — FULL GO)
**المدة المقدرة:** 12-16 أسبوعًا

---

## 1. الوضع الراهن

### نقاط القوة
- ✅ 0 TypeScript errors, 0 build failures
- ✅ 99.3% test pass rate (5706/5747)
- ✅ 0 `as any`, 0 `@ts-nocheck`, 0 raw console in production
- ✅ 8 نماذج تدقيق → نموذج واحد (PlatformAuditLog)
- ✅ 7 منتجات في L5 Pilot-ready (conditional)
- ✅ Arabic-first RTL كامل
- ✅ NextAuth v5 + MFA + RBAC middleware
- ✅ OpenTelemetry tracing + Sentry monitoring
- ✅ Hash chain tamper evidence
- ✅ Proof-of-work anti-spam
- ✅ Prisma schema: 244→235 نموذجًا بعد الدمج

### نقاط الضعف
- ⚠️ 4 pre-existing test failures
- ⚠️ 12 write site remnants in test mocks
- ⚠️ 23 TODO/FIXME في SalesOS stubs
- ⚠️ In-memory event bus/queue (يضيع مع Fargate)
- ⚠️ لا اختبار اختراق
- ⚠️ لا بيئة staging حقيقية
- ⚠️ لا عميل pilot فعلي

---

## 2. المسار الكامل (4 أشهر)

### Sprint 1: إغلاق المتبقي (الأسبوع 1)
**الهدف:** 0 test failures, 100% pass rate, جاهزية كاملة للـ CI/CD

| المهمة | الملفات | الجهد |
|--------|---------|-------|
| إصلاح migration-evidence.test.ts | تحديث قائمة migrations | 15min |
| إصلاح decision-export.test.ts (6 tests) | توافق مع export refactor | 30min |
| إصلاح skill-evaluator.test.ts | تثبيت glob dependency | 15min |
| تحويل critical-paths.test.ts إلى unit tests | إزالة اعتماد DB الحي | 1h |
| إزالة آخر 12 إشارة للنماذج المحذوفة من mocks | تنظيف `sales/__tests__/` | 45min |
| `npm audit fix` | تحديث التبعيات | 15min |
| تشغيل `prisma db seed` | التحقق من seed data | 15min |
| كتابة ADR-110: Audit Log Merge | توثيق القرار المعماري | 30min |

**النتيجة:** 442/442 pass, 0 failures, CI/CD green, seeds working

---

### Sprint 2: أمان البنية التحتية (الأسابيع 2-4)
**الهدف:** سد فجوات الأمان والإنتاج

#### 2.1 أمان التطبيق
| المهمة | الأولوية | التفاصيل |
|--------|----------|---------|
| اختبار الاختراق | **BLOCKING** | جهة خارجية — OWASP Top 10 + API + business logic |
| CSP audit | High | التحقق من security headers كاملة |
| Dependency audit | High | `npm audit` + Snyk scan |
| Secret rotation | Medium | تدوير AUTH_SECRET + API keys |
| RBAC stress test | Medium | اختبار جميع 124 route-to-role entries |

#### 2.2 بنية تحتية
| المهمة | الأولوية | التفاصيل |
|--------|----------|---------|
| تفعيل Redis في الإنتاج | **BLOCKING** | `RATE_LIMITER=redis` + `CACHE_STORE=redis` |
| تفعيل ClamAV | **BLOCKING** | `SCANNER_PROVIDER=clamav` لفحص الملفات |
| restore-drill على RDS | **BLOCKING** | `scripts/platform/restore-drill.mjs` على بيئة حقيقية |
| Terraform apply للـ staging | High | ECS + RDS + Redis + CloudFront |
| WAF rules | High | Rate limiting + SQL injection + XSS على CloudFront |
| Backup verification | High | pg_dump آلي + restore test شهري |

#### 2.3 مراقبة
| المهمة | الأولوية | التفاصيل |
|--------|----------|---------|
| Sentry source maps | High | تكوين auth token للإنتاج |
| CloudWatch dashboards | High | 4 dashboards + 5 alarms موثقة في Terraform |
| Uptime monitoring | High | Pingdom/Checkly خارجي |
| PagerDuty integration | Medium | ربط alarms بـ on-call |
| Log aggregation | Medium | CloudWatch Logs → structured JSON parsing |

---

### Sprint 3: تحضير الـPilot (الأسابيع 5-6)
**الهدف:** بيئة Pilot جاهزة لعميل حقيقي

| المهمة | التفاصيل |
|--------|---------|
| نشر staging environment | ECS Fargate + RDS + Redis + ClamAV |
| تحميل seed-pilot.ts | 8 users, 5 products, 150+ سجل سعودي |
| اختبار شامل لـ LocalContentOS | الميزة التنافسية الفريدة |
| اختبار شامل لـ DecisionOS | workflow + simulation + approval |
| اختبار شامل لـ SalesOS | pipeline + intelligence + CRM |
| تدقيق المسار الكامل | إنشاء → مراجعة → موافقة → تصدير → سجل تدقيق |
| توثيق المشغل | runbook نهائي بالعربية والإنجليزية |
| دليل المستخدم | PILOT_USER_GUIDE محدث |
| فيديو Demo | 20-minute walkthrough حسب DEMO_FLOW.md |

---

### Sprint 4: تحسين المنتج (الأسابيع 7-8)
**الهدف:** رفع المنتجات من L5→L6 (Production-hardened)

#### 4.1 Core Platform
| المهمة | الوصف |
|--------|-------|
| Event bus persistence | نقل event bus من in-memory → PostgreSQL outbox |
| CQRS projections | تخزين projections في DB بدل memory |
| Cache strategy audit | جميع dashboard caches تستخدم Redis مع TTL |
| Connection pooling | تحسين Prisma connection pool للإنتاج |
| Query optimization | فحص slow queries + إضافة indexes |

#### 4.2 LocalContentOS (المنتج الاستراتيجي)
| المهمة | الوصف |
|--------|-------|
| Scoring calibration | معايرة local content scoring مع بيانات سعودية |
| IKTVA alignment | توافق مع متطلبات هيئة المحتوى المحلي |
| Bulk import | رفع ملفات Excel/CSV للموردين والمشتريات |
| Dashboard performance | تخزين مؤقت للمؤشرات الرئيسية |
| Report templates | قوالب تقارير رسمية (عربي + إنجليزي) |

#### 4.3 DecisionOS
| المهمة | الوصف |
|--------|-------|
| Simulation accuracy | تحسين دقة محاكاة Monte Carlo |
| Committee workflow | سير عمل اللجان متعدد المستويات |
| Escalation rules | قواعد تصعيد آلية |
| Decision archive | أرشفة القرارات المكتملة |
| Analytics dashboard | لوحة تحليلات القرارات |

#### 4.4 SalesOS (من CRM → Revenue Intelligence)
| المهمة | الوصف |
|--------|-------|
| Remove TODO/FIXME stubs | 23 مدخلاً في SalesOS vnext/v02 |
| Pipeline forecasting | توقعات خط الأنابيب |
| Deal health scoring | تقييم صحة الصفقات آليًا |
| CRM sync (bidirectional) | مزامنة ثنائية مع HubSpot/Salesforce |
| Email integration | تتبع البريد الإلكتروني |

---

### Sprint 5: الامتثال والتجاري (الأسابيع 9-10)
**الهدف:** جاهزية للعملاء المؤسسيين

#### 5.1 الامتثال
| المهمة | التفاصيل |
|--------|---------|
| SOC2 Type II readiness | سياسات + أدلة + ضوابط |
| ISO 27001 gap assessment | فجوات مقارنة بالمعيار |
| NCA (السعودية) | متطلبات الأمن السيبراني السعودي |
| PDPL (السعودية) | قانون حماية البيانات الشخصية |
| Data residency | تخزين البيانات داخل السعودية (AWS Bahrain/ME) |
| DPIA | Data Protection Impact Assessment |
| Retention policy | سياسة احتفاظ بالبيانات موثقة |

#### 5.2 التجاري
| المهمة | التفاصيل |
|--------|---------|
| Pricing model finalization | 3-tier: Starter/Professional/Enterprise |
| SLA definition | 99.5% uptime, 4h response, 24h resolution |
| Contract templates | Arabic + English MSA + DPA |
| Client onboarding playbook | دليل تشغيل العميل |
| Support tiers | L1/L2/L3 تعريف المستويات |
| Knowledge base | مركز مساعدة بالعربية |

---

### Sprint 6: الإطلاق (الأسابيع 11-12)
**الهدف:** Production Go-Live

| المهمة | التفاصيل |
|--------|---------|
| Production deployment | ECS Fargate multi-AZ |
| Database final migration | تطبيق `drop_deprecated_audit_models` |
| DNS + SSL | CloudFront + ACM certificate |
| CDN configuration | CloudFront caching rules |
| Load testing | k6/Artillery: 1000 concurrent users |
| Failover test | محاكاة فشل AZ والاستعادة |
| Go/No-Go meeting | مراجعة جميع المعايير |
| Launch | 🚀 |

---

## 3. المنتجات — خريطة المستوى المستهدف

| المنتج | الحالي | Sprint 4 | Sprint 6 |
|--------|--------|----------|----------|
| **AuditOS** | L5 | L5 (مستقر) | L6 |
| **LocalContentOS** | L5 | L5+ (معاير) | L6 |
| **DecisionOS** | L5 | L5+ (محسّن) | L6 |
| **SalesOS** | L5 | L5 (منظف) | L5+ |
| **WorkflowOS** | L5 | L5 (مستقر) | L5+ |
| **Office AI** | L5 | L5 (مستقر) | L5+ |
| **RiskOS** | L5 | L5 (مستقر) | L5+ |
| **Platform Core** | L5 | L6 | L6 |

---

## 4. المخاطر الرئيسية

| المخاطرة | الاحتمال | التأثير | التخفيف |
|----------|----------|---------|---------|
| اختبار الاختراق يجد ثغرات حرجة | متوسط | عالي | Sprint 2 مبكرًا |
| Redis/ClamAV غير متوفرين | منخفض | عالي | تفعيل قبل Pilot |
| عدم توفر عميل Pilot | متوسط | متوسط | تسويق مباشر + شراكات |
| تأخير SOC2/ISO | عالي | منخفض | البدء مبكرًا |
| تكلفة البنية التحتية | منخفض | متوسط | AWS reserved instances |

---

## 5. الموارد المطلوبة

| المورد | Sprint 1 | Sprint 2-3 | Sprint 4-6 |
|--------|----------|------------|------------|
| مهندس Full-stack | 1 | 1-2 | 2 |
| DevOps/SRE | — | 1 | 1 |
| أمن سيبراني (خارجي) | — | 1 (pen test) | — |
| Compliance (خارجي) | — | — | 1 (SOC2) |
| مدير منتج | — | 1 | 1 |
| AWS budget | $0 | ~$500/mo | ~$1000-2000/mo |

---

## 6. مؤشرات النجاح

| المؤشر | Sprint 1 | Sprint 3 | Sprint 6 |
|--------|----------|----------|----------|
| Test pass rate | 100% | 100% | 100% |
| Pen test criticals | — | 0 | 0 |
| Uptime | — | 99% | 99.5% |
| P95 latency | — | <500ms | <300ms |
| Seed data completeness | ✅ | 150+ records | 500+ records |
| Pilot customers | — | 1 | 3+ |
| SOC2 readiness | — | 60% | 90%+ |

---

## 7. الجدول الزمني

```
         Sprint 1    Sprint 2      Sprint 3    Sprint 4      Sprint 5      Sprint 6
         (أسبوع 1)   (أسبوع 2-4)   (أسبوع 5-6) (أسبوع 7-8)   (أسبوع 9-10)  (أسبوع 11-12)
         ─────────   ───────────   ──────────  ───────────   ────────────  ────────────
السعودية:  28 يوليو    4-18 أغسطس    25 أغسطس-1 سبتمبر  8-15 سبتمبر  22 سبتمبر-6 أكتوبر  13-20 أكتوبر
         ═════════   ═══════════   ══════════  ═══════════   ════════════  ════════════
         إغلاق       أمان+بنية     تحضير Pilot  تحسين منتج    امتثال+تجاري  إطلاق 🚀
```

---

## 8. القرارات المطلوبة

| القرار | من | متى |
|--------|-----|-----|
| ميزانية AWS staging/production | الإدارة | Sprint 1 |
| اختيار جهة اختبار الاختراق | CTO | Sprint 2 |
| اختيار عميل Pilot أول | مدير المنتج | Sprint 3 |
| نموذج التسعير النهائي | الإدارة | Sprint 5 |
| Go/No-Go للإنتاج | الجميع | Sprint 6 |

---

## 9. الخطوة التالية الآن

**Sprint 1 — إغلاق المتبقي (اليوم)**

```
✅ 1.1 migration-evidence.test.ts
✅ 1.2 decision-export.test.ts
✅ 1.3 skill-evaluator.test.ts
✅ 1.4 critical-paths.test.ts → unit tests
✅ 1.5 آخر 12 mock reference
✅ 1.6 npm audit fix
✅ 1.7 prisma db seed
✅ 1.8 ADR-110: Audit Log Merge
```

**الهدف:** 442/442 pass, 0 failures, CI/CD green 🟢

---

جاهز؟ نبدأ Sprint 1؟