import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { RagDashboard } from "@/components/audit/knowledge/rag-dashboard"

export default function RagKnowledgePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">لوحة تحكم RAG</h1>
        <p className="text-muted-foreground">
          مراقبة أداء البحث الدلالي في قاعدة معرفة IFRS، مقاييس الاستجابة، ومعدل الاستخدام
        </p>
        <Link
          href="/audit/knowledge"
          className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="size-3.5" />
          العودة إلى المعرفة التدقيقية
        </Link>
      </div>
      <RagDashboard />
    </div>
  )
}
