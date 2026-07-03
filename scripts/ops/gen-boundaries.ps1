# Product-specific configurations: icon name, Arabic title, English title
$products = @{
    'content-studio' = @{icon='FileText'; arTitle='استوديو المحتوى'; enTitle='ContentStudio'}
    'content-studio/[workspaceId]' = @{icon='FileText'; arTitle='مساحة المحتوى'; enTitle='Content Workspace'}
    'content-studio/[workspaceId]/[contentId]' = @{icon='FileText'; arTitle='المحتوى'; enTitle='Content Item'}
    'content-studio/[workspaceId]/create' = @{icon='FilePlus'; arTitle='إنشاء محتوى'; enTitle='Create Content'}
    'content-studio/templates' = @{icon='FileText'; arTitle='القوالب'; enTitle='Templates'}
    'risk' = @{icon='AlertTriangle'; arTitle='مخاطر المنشأة'; enTitle='RiskOS'}
    'risk/[id]' = @{icon='AlertTriangle'; arTitle='المخاطرة'; enTitle='Risk Detail'}
    'risk/assessments' = @{icon='AlertTriangle'; arTitle='التقييمات'; enTitle='Risk Assessments'}
    'risk/assessments/[id]' = @{icon='AlertTriangle'; arTitle='التقييم'; enTitle='Assessment Detail'}
    'contacts' = @{icon='Users'; arTitle='جهات الاتصال'; enTitle='LocalContactOS'}
    'contacts/dashboard' = @{icon='LayoutDashboard'; arTitle='لوحة جهات الاتصال'; enTitle='Contact Dashboard'}
    'contacts/new' = @{icon='UserPlus'; arTitle='جهة اتصال جديدة'; enTitle='New Contact'}
    'contacts/[id]' = @{icon='User'; arTitle='جهة الاتصال'; enTitle='Contact'}
    'contacts/[id]/edit' = @{icon='Edit'; arTitle='تعديل جهة الاتصال'; enTitle='Edit Contact'}
    'contacts/[id]/interactions' = @{icon='MessageCircle'; arTitle='التفاعلات'; enTitle='Interactions'}
    'contacts/[id]/interactions/new' = @{icon='MessageCircle'; arTitle='تفاعل جديد'; enTitle='New Interaction'}
    'contacts/[id]/relations' = @{icon='Share2'; arTitle='العلاقات'; enTitle='Relations'}
    'contacts/[id]/relations/new' = @{icon='Share2'; arTitle='علاقة جديدة'; enTitle='New Relation'}
    'institutional-memory' = @{icon='Network'; arTitle='الذاكرة المؤسسية'; enTitle='Institutional Memory'}
    'institutional-memory/collections' = @{icon='FolderOpen'; arTitle='المجموعات'; enTitle='Collections'}
    'institutional-memory/events' = @{icon='History'; arTitle='الأحداث'; enTitle='Events'}
    'institutional-memory/graph' = @{icon='Share2'; arTitle='الرسم البياني'; enTitle='Knowledge Graph'}
    'local-content' = @{icon='Building2'; arTitle='المحتوى المحلي'; enTitle='LocalContentOS'}
    'local-content/ai-advisor' = @{icon='Bot'; arTitle='المستشار الذكي'; enTitle='AI Advisor'}
    'local-content/analytics' = @{icon='BarChart3'; arTitle='التحليلات'; enTitle='Analytics'}
    'local-content/campaigns' = @{icon='Megaphone'; arTitle='الحملات'; enTitle='Campaigns'}
    'local-content/campaigns/[id]' = @{icon='Megaphone'; arTitle='الحملة'; enTitle='Campaign Detail'}
    'local-content/classification-rules' = @{icon='FileCheck'; arTitle='قواعد التصنيف'; enTitle='Classification Rules'}
    'local-content/health' = @{icon='HeartPulse'; arTitle='صحة المنشأة'; enTitle='Health'}
    'local-content/outputs' = @{icon='FileOutput'; arTitle='المخرجات'; enTitle='Outputs'}
    'local-content/pilot-readiness' = @{icon='Rocket'; arTitle='جاهزية التجربة'; enTitle='Pilot Readiness'}
    'local-content/projects' = @{icon='FolderKanban'; arTitle='المشاريع'; enTitle='Projects'}
    'local-content/projects/[projectId]' = @{icon='FolderKanban'; arTitle='المشروع'; enTitle='Project Detail'}
    'local-content/projects/[projectId]/approval' = @{icon='CheckCircle'; arTitle='الاعتماد'; enTitle='Approval'}
    'local-content/projects/[projectId]/audit-trail' = @{icon='ScrollText'; arTitle='سجل التدقيق'; enTitle='Audit Trail'}
    'local-content/projects/[projectId]/classification' = @{icon='FileCheck'; arTitle='التصنيف'; enTitle='Classification'}
    'local-content/projects/[projectId]/evidence' = @{icon='FolderOpen'; arTitle='الأدلة'; enTitle='Evidence'}
    'local-content/projects/[projectId]/findings' = @{icon='Search'; arTitle='النتائج'; enTitle='Findings'}
    'local-content/projects/[projectId]/reports' = @{icon='FileBarChart'; arTitle='التقارير'; enTitle='Reports'}
    'local-content/projects/[projectId]/review' = @{icon='Eye'; arTitle='المراجعة'; enTitle='Review'}
    'local-content/projects/[projectId]/spend' = @{icon='DollarSign'; arTitle='الإنفاق'; enTitle='Spend'}
    'local-content/projects/[projectId]/suppliers' = @{icon='Truck'; arTitle='الموردين'; enTitle='Suppliers'}
    'local-content/projects/[projectId]/tender-match' = @{icon='GitCompare'; arTitle='مطابقة المناقصات'; enTitle='Tender Match'}
    'local-content/projects/[projectId]/verification' = @{icon='ShieldCheck'; arTitle='التحقق'; enTitle='Verification'}
    'local-content/projects/[projectId]/workbook/[workbookId]/ai-advisor' = @{icon='Bot'; arTitle='المستشار الذكي'; enTitle='AI Advisor'}
    'local-content/quality-dashboard' = @{icon='Gauge'; arTitle='لوحة الجودة'; enTitle='Quality Dashboard'}
    'local-content/review' = @{icon='Eye'; arTitle='المراجعة'; enTitle='Review'}
    'local-content/review-center' = @{icon='ListChecks'; arTitle='مركز المراجعة'; enTitle='Review Center'}
    'local-content/settings/integrations' = @{icon='Cable'; arTitle='التكاملات'; enTitle='Integrations'}
    'local-content/workbook' = @{icon='BookOpen'; arTitle='دفتر العمل'; enTitle='Workbook'}
    'local-content/workbook/[workbookId]' = @{icon='BookOpen'; arTitle='دفتر العمل'; enTitle='Workbook'}
    'local-content/projects/[projectId]/workbook' = @{icon='BookOpen'; arTitle='دفتر العمل'; enTitle='Workbook'}
    'local-content/projects/[projectId]/workbook/[workbookId]' = @{icon='BookOpen'; arTitle='دفتر العمل'; enTitle='Workbook'}
    'sales' = @{icon='TrendingUp'; arTitle='نظام المبيعات'; enTitle='SalesOS'}
    'sales/accounts' = @{icon='Building2'; arTitle='الحسابات'; enTitle='Accounts'}
    'sales/accounts/[id]' = @{icon='Building2'; arTitle='الحساب'; enTitle='Account'}
    'sales/accounts/[id]/brief' = @{icon='FileText'; arTitle='موجز الحساب'; enTitle='Account Brief'}
    'sales/accounts/new' = @{icon='UserPlus'; arTitle='حساب جديد'; enTitle='New Account'}
    'sales/activities' = @{icon='Activity'; arTitle='النشاطات'; enTitle='Activities'}
    'sales/approval' = @{icon='CheckCircle'; arTitle='الاعتماد'; enTitle='Approval'}
    'sales/audit-trail' = @{icon='ScrollText'; arTitle='سجل التدقيق'; enTitle='Audit Trail'}
    'sales/command-center' = @{icon='Monitor'; arTitle='مركز القيادة'; enTitle='Command Center'}
    'sales/deals' = @{icon='TrendingUp'; arTitle='الصفقات'; enTitle='Deals'}
    'sales/deals/[id]' = @{icon='TrendingUp'; arTitle='الصفقة'; enTitle='Deal'}
    'sales/deals/[id]/pilot' = @{icon='Rocket'; arTitle='التجربة'; enTitle='Pilot'}
    'sales/deals/new' = @{icon='PlusCircle'; arTitle='صفقة جديدة'; enTitle='New Deal'}
    'sales/forecast' = @{icon='ChartLine'; arTitle='التوقعات'; enTitle='Forecast'}
    'sales/funnel' = @{icon='Funnel'; arTitle='مسار التحويل'; enTitle='Funnel'}
    'sales/icp' = @{icon='Target'; arTitle='العميل المثالي'; enTitle='ICP'}
    'sales/intelligence' = @{icon='Brain'; arTitle='الذكاء'; enTitle='Intelligence'}
    'sales/intelligence/forecasts' = @{icon='ChartLine'; arTitle='توقعات الذكاء'; enTitle='Intelligence Forecasts'}
    'sales/opportunities' = @{icon='Target'; arTitle='الفرص'; enTitle='Opportunities'}
    'sales/opportunities/[id]' = @{icon='Target'; arTitle='الفرصة'; enTitle='Opportunity'}
    'sales/opportunities/new' = @{icon='PlusCircle'; arTitle='فرصة جديدة'; enTitle='New Opportunity'}
    'sales/outreach' = @{icon='Send'; arTitle='التواصل'; enTitle='Outreach'}
    'sales/pilot-handoff/[dealId]' = @{icon='Rocket'; arTitle='تسليم التجربة'; enTitle='Pilot Handoff'}
    'sales/pipeline' = @{icon='GitBranch'; arTitle='خط الأنابيب'; enTitle='Pipeline'}
    'sales/pipeline-depth' = @{icon='BarChart3'; arTitle='عمق الأنابيب'; enTitle='Pipeline Depth'}
    'sales/reports' = @{icon='FileBarChart'; arTitle='التقارير'; enTitle='Reports'}
    'sales/revenue' = @{icon='DollarSign'; arTitle='الإيرادات'; enTitle='Revenue'}
    'sales/review' = @{icon='Eye'; arTitle='المراجعة'; enTitle='Review'}
    'sales/settings/crm' = @{icon='Settings'; arTitle='إعدادات CRM'; enTitle='CRM Settings'}
    'sales/signals' = @{icon='Bell'; arTitle='الإشارات'; enTitle='Signals'}
    'sampling' = @{icon='Beaker'; arTitle='أخذ العينات'; enTitle='Sampling'}
    'sampling/[id]' = @{icon='Beaker'; arTitle='العينة'; enTitle='Sample'}
    'office-ai/advanced' = @{icon='Bot'; arTitle='المساعد الذكي المتقدم'; enTitle='Office AI Advanced'}
    'office-ai/advanced/role-config' = @{icon='Shield'; arTitle='تكوين الأدوار'; enTitle='Role Config'}
    'office-ai/advanced/schedules' = @{icon='Calendar'; arTitle='الجدولة'; enTitle='Schedules'}
    'office-ai/advanced/templates' = @{icon='FileText'; arTitle='قوالب المساعد'; enTitle='Assistant Templates'}
    'assistant/stats' = @{icon='BarChart3'; arTitle='إحصائيات المساعد'; enTitle='Assistant Stats'}
    'settings/ai-governance' = @{icon='Shield'; arTitle='حوكمة الذكاء الاصطناعي'; enTitle='AI Governance'}
    'settings/retention' = @{icon='Archive'; arTitle='سياسة الاحتفاظ'; enTitle='Retention'}
    'settings/audit-bridge/logs' = @{icon='ScrollText'; arTitle='سجل الجسر'; enTitle='Audit Bridge Logs'}
    'settings/organization/advanced/events' = @{icon='Activity'; arTitle='أحداث المنشأة'; enTitle='Org Events'}
    '(dashboard)/intelligence' = @{icon='Brain'; arTitle='الذكاء المؤسسي'; enTitle='Intelligence'}
    '(dashboard)/intelligence/sectors' = @{icon='Globe'; arTitle='القطاعات'; enTitle='Sectors'}
    '(dashboard)/intelligence/sectors/[id]' = @{icon='Globe'; arTitle='القطاع'; enTitle='Sector'}
    '(dashboard)/knowledge-foundation' = @{icon='Brain'; arTitle='أساس المعرفة'; enTitle='Knowledge Foundation'}
    '(dashboard)/knowledge-foundation/[id]' = @{icon='Brain'; arTitle='أساس المعرفة'; enTitle='Knowledge Foundation'}
    '(dashboard)/knowledge-foundation/diff' = @{icon='GitCompare'; arTitle='المقارنة'; enTitle='Diff'}
    '(dashboard)/knowledge-foundation/history' = @{icon='History'; arTitle='السجل'; enTitle='History'}
    '(dashboard)/knowledge-foundation/new' = @{icon='PlusCircle'; arTitle='جديد'; enTitle='New'}
    '(dashboard)/knowledge-review' = @{icon='CheckSquare'; arTitle='مراجعة المعرفة'; enTitle='Knowledge Review'}
    '(dashboard)/knowledge-review/[id]' = @{icon='CheckSquare'; arTitle='مراجعة المعرفة'; enTitle='Knowledge Review'}
    '(dashboard)/monitoring' = @{icon='Activity'; arTitle='المراقبة'; enTitle='Monitoring'}
    '(dashboard)/monitoring/ai' = @{icon='Brain'; arTitle='مراقبة الذكاء الاصطناعي'; enTitle='AI Monitoring'}
    '(dashboard)/governance-hub' = @{icon='Shield'; arTitle='مركز الحوكمة'; enTitle='Governance Hub'}
    '(dashboard)/notifications' = @{icon='Bell'; arTitle='الإشعارات'; enTitle='Notifications'}
    '(dashboard)/operator' = @{icon='Terminal'; arTitle='المشغل'; enTitle='Operator'}
    '(dashboard)/overview' = @{icon='LayoutDashboard'; arTitle='نظرة عامة'; enTitle='Overview'}
    '(dashboard)/settings/ai' = @{icon='Brain'; arTitle='إعدادات الذكاء الاصطناعي'; enTitle='AI Settings'}
    '(dashboard)/settings/audit-logs' = @{icon='ScrollText'; arTitle='سجلات التدقيق'; enTitle='Audit Logs'}
    '(dashboard)/settings/chain-verification' = @{icon='Shield'; arTitle='التحقق المتسلسل'; enTitle='Chain Verification'}
    '(dashboard)/settings/mfa' = @{icon='Shield'; arTitle='التحقق متعدد العوامل'; enTitle='MFA'}
    '(dashboard)/settings/platform-organization' = @{icon='Building2'; arTitle='المنشأة'; enTitle='Platform Organization'}
    '(dashboard)/settings/siem' = @{icon='Monitor'; arTitle='SIEM'; enTitle='SIEM'}
    '(dashboard)/settings/skills/evaluate' = @{icon='Brain'; arTitle='تقييم المهارات'; enTitle='Skills Evaluation'}
    '(dashboard)/settings/sso' = @{icon='Shield'; arTitle='الدخول الموحد'; enTitle='SSO'}
    '(dashboard)/settings/team' = @{icon='Users'; arTitle='الفريق'; enTitle='Team'}
    '(dashboard)/settings/workspaces' = @{icon='Layout'; arTitle='مساحات العمل'; enTitle='Workspaces'}
    '(dashboard)/decisions/gov' = @{icon='Shield'; arTitle='حوكمة القرارات'; enTitle='Decision Governance'}
    '(dashboard)/decisions/gov/escalation-rules' = @{icon='ArrowUpCircle'; arTitle='قواعد التصعيد'; enTitle='Escalation Rules'}
    '(dashboard)/decisions/new' = @{icon='PlusCircle'; arTitle='قرار جديد'; enTitle='New Decision'}
    '(dashboard)/decisions/pilot-readiness' = @{icon='Rocket'; arTitle='جاهزية التجربة'; enTitle='Pilot Readiness'}
}
