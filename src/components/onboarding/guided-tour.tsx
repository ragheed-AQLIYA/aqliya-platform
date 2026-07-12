"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"

interface TourStep {
  target: string
  title: string
  content: string
  placement?: "top" | "bottom" | "left" | "right"
}

interface GuidedTourProps {
  tourKey: string
  steps: TourStep[]
  onComplete?: () => void
}

export function GuidedTour({ tourKey, steps, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const completed = localStorage.getItem(`tour_${tourKey}`)
    if (!completed) {
      const timer = setTimeout(() => setCurrentStep(0), 500)
      return () => clearTimeout(timer)
    }
  }, [tourKey])

  const startTour = useCallback(() => {
    setCurrentStep(0)
    setIsVisible(true)
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }, [currentStep, steps.length])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const completeTour = useCallback(() => {
    localStorage.setItem(`tour_${tourKey}`, "completed")
    setCurrentStep(-1)
    setIsVisible(false)
    onComplete?.()
  }, [tourKey, onComplete])

  const skipTour = useCallback(() => {
    completeTour()
  }, [completeTour])

  useEffect(() => {
    if (currentStep < 0 || currentStep >= steps.length) return
    const step = steps[currentStep]
    const el = document.querySelector(step.target)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [currentStep, steps])

  if (currentStep < 0 || currentStep >= steps.length) return null

  const step = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast = currentStep === steps.length - 1

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={skipTour} />

      <div className="fixed bottom-8 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-xl border bg-card p-5 shadow-xl">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            الخطوة {currentStep + 1} من {steps.length}
          </span>
          <button
            onClick={skipTour}
            className="text-xs text-muted-foreground underline hover:text-foreground"
            aria-label="تخطي الجولة"
          >
            تخطي
          </button>
        </div>

        <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{step.content}</p>

        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={isFirst}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-30"
            aria-label="الخطوة السابقة"
          >
            السابق
          </button>

          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`inline-block h-2 w-2 rounded-full ${
                  i === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <button
            onClick={isLast ? completeTour : nextStep}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm text-primary-foreground"
            aria-label={isLast ? "إنهاء الجولة" : "التالي"}
          >
            {isLast ? "إنهاء" : "التالي"}
          </button>
        </div>
      </div>
    </>
  )
}
