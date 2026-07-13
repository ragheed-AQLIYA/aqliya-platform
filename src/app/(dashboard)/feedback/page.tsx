"use client"

import { useState } from "react"

type Category = "bug" | "feature" | "general"
type Rating = 1 | 2 | 3 | 4 | 5

interface FeedbackEntry {
  id: string
  category: Category
  message: string
  rating: Rating
  createdAt: string
}

const categoryLabels: Record<Category, { ar: string; en: string }> = {
  bug: { ar: "مشكلة تقنية", en: "Bug Report" },
  feature: { ar: "طلب ميزة", en: "Feature Request" },
  general: { ar: "ملاحظة عامة", en: "General Feedback" },
}

const ratingLabels: Record<Rating, { ar: string; en: string }> = {
  1: { ar: "ضعيف جداً", en: "Very Poor" },
  2: { ar: "ضعيف", en: "Poor" },
  3: { ar: "مقبول", en: "Fair" },
  4: { ar: "جيد", en: "Good" },
  5: { ar: "ممتاز", en: "Excellent" },
}

function getStoredFeedback(): FeedbackEntry[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("aqliya_feedback")
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function storeFeedback(entry: FeedbackEntry) {
  const existing = getStoredFeedback()
  existing.push(entry)
  localStorage.setItem("aqliya_feedback", JSON.stringify(existing))
}

export default function FeedbackPage() {
  const [category, setCategory] = useState<Category>("general")
  const [message, setMessage] = useState("")
  const [rating, setRating] = useState<Rating>(3)
  const [submitted, setSubmitted] = useState(false)
  const [history, setHistory] = useState<FeedbackEntry[]>([])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return

    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      category,
      message: message.trim(),
      rating,
      createdAt: new Date().toISOString(),
    }

    storeFeedback(entry)
    setHistory(getStoredFeedback())
    setSubmitted(true)
    setMessage("")
    setRating(3)
    setCategory("general")
  }

  function handleReset() {
    setSubmitted(false)
    setHistory(getStoredFeedback())
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border bg-card p-8 text-center">
          <div className="mb-4 text-4xl">شكراً</div>
          <h1 className="mb-2 text-2xl font-bold">تم إرسال ملاحظتك</h1>
          <p className="mb-6 text-muted-foreground">
            Your feedback has been submitted. Thank you for helping us improve
            AQLIYA.
          </p>
          <p className="mb-6 text-sm text-muted-foreground">
            ملاحظتك محفوظة محلياً. ستم مراجعتها من قبل فريق المنصة.
          </p>
          <button
            onClick={handleReset}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            إرسال ملاحظة أخرى / Submit Another
          </button>
        </div>

        {history.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">
              ملاحظاتك السابقة / Your Previous Feedback
            </h2>
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-md border p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {categoryLabels[entry.category].ar} /{" "}
                      {categoryLabels[entry.category].en}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                  <p className="mb-2 text-sm">{entry.message}</p>
                  <div className="text-xs text-muted-foreground">
                    التقييم / Rating: {"★".repeat(entry.rating)}
                    {"☆".repeat(5 - entry.rating)} ({entry.rating}/5)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">الملاحظات والاقتراحات</h1>
        <p className="text-sm text-muted-foreground">
          Feedback &amp; Suggestions — Help us improve AQLIYA
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            التصنيف / Category
          </label>
          <div className="flex gap-3">
            {(Object.keys(categoryLabels) as Category[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                  category === cat
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {categoryLabels[cat].ar}
                <br />
                <span className="text-xs opacity-70">
                  {categoryLabels[cat].en}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            التقييم / Rating
          </label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as Rating[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                className={`h-10 w-10 rounded-md border text-lg transition-colors ${
                  rating === r
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
                title={`${ratingLabels[r].ar} / ${ratingLabels[r].en}`}
              >
                {r}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {ratingLabels[rating].ar} / {ratingLabels[rating].en}
          </p>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="feedback-message" className="mb-2 block text-sm font-medium">
            الملاحظة / Message
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            placeholder="اكتب ملاحظتك هنا... / Write your feedback here..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!message.trim()}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          إرسال الملاحظة / Submit Feedback
        </button>
      </form>
    </div>
  )
}
