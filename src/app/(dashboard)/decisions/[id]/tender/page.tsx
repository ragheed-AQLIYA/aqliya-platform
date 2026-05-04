"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getTenderProfile, createOrUpdateTenderProfile } from "@/actions/tender"
import { useState, useEffect } from "react"

export default function TenderPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    clientName: "",
    estimatedContractValue: "",
    estimatedCost: "",
    durationMonths: "",
    requiredCapacity: "",
    internalAvailableCapacity: "",
    marginEstimate: "",
    strategicFitScore: "50",
    riskLevel: "MEDIUM",
  })

  // Extract id from params Promise
  useEffect(() => {
    const getId = async () => {
      const { id: decisionId } = await params
      setId(decisionId)
    }
    getId()
  }, [params])

  // Load existing tender profile
  useEffect(() => {
    if (!id) return

    const loadTender = async () => {
      const result = await getTenderProfile(id)
      if (result.success && result.data) {
        const tender = result.data
        setFormData({
          clientName: tender.clientName || "",
          estimatedContractValue: tender.estimatedContractValue?.toString() || "",
          estimatedCost: tender.estimatedCost?.toString() || "",
          durationMonths: tender.durationMonths?.toString() || "",
          requiredCapacity: tender.requiredCapacity?.toString() || "",
          internalAvailableCapacity: tender.internalAvailableCapacity?.toString() || "",
          marginEstimate: tender.marginEstimate?.toString() || "",
          strategicFitScore: tender.strategicFitScore?.toString() || "50",
          riskLevel: tender.riskLevel || "MEDIUM",
        })
      }
      setLoading(false)
    }
    loadTender()
  }, [id])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (success) setSuccess(false)
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    // Validate required fields
    if (!formData.clientName || !formData.estimatedContractValue || !formData.estimatedCost) {
      setError("Please fill in all required fields")
      setSaving(false)
      return
    }

    const result = await createOrUpdateTenderProfile(id, {
      clientName: formData.clientName,
      estimatedContractValue: parseFloat(formData.estimatedContractValue),
      estimatedCost: parseFloat(formData.estimatedCost),
      durationMonths: parseInt(formData.durationMonths),
      requiredCapacity: parseInt(formData.requiredCapacity),
      internalAvailableCapacity: parseInt(formData.internalAvailableCapacity),
      marginEstimate: parseFloat(formData.marginEstimate),
      strategicFitScore: parseInt(formData.strategicFitScore),
      riskLevel: formData.riskLevel,
    }, "mock-user-id")

    if (result.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError(result.error || "Failed to save")
    }

    setSaving(false)
  }

  if (loading || !id) {
    return (
      <div>
        <DecisionTabs decisionId={id || ""} />
        <div className="mt-6 text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <DecisionTabs decisionId={id} />
      <div className="mt-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Tender Details</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">
            Tender profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="clientName">Client / Issuing Entity *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleChange("clientName", e.target.value)}
              placeholder="Enter client name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractValue">Estimated Contract Value *</Label>
              <Input
                id="contractValue"
                type="number"
                value={formData.estimatedContractValue}
                onChange={(e) => handleChange("estimatedContractValue", e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="estimatedCost">Estimated Cost *</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => handleChange("estimatedCost", e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Duration (Months)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.durationMonths}
              onChange={(e) => handleChange("durationMonths", e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requiredCapacity">Required Capacity</Label>
              <Input
                id="requiredCapacity"
                type="number"
                value={formData.requiredCapacity}
                onChange={(e) => handleChange("requiredCapacity", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="availableCapacity">Internal Available Capacity</Label>
              <Input
                id="availableCapacity"
                type="number"
                value={formData.internalAvailableCapacity}
                onChange={(e) => handleChange("internalAvailableCapacity", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="strategicFit">Strategic Fit Score (0-100)</Label>
              <Input
                id="strategicFit"
                type="number"
                min="0"
                max="100"
                value={formData.strategicFitScore}
                onChange={(e) => handleChange("strategicFitScore", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="margin">Margin Estimate (%)</Label>
              <Input
                id="margin"
                type="number"
                step="0.1"
                value={formData.marginEstimate}
                onChange={(e) => handleChange("marginEstimate", e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="riskLevel">Risk Level</Label>
            <Select
              value={formData.riskLevel}
              onValueChange={(value: string | null) => {
                if (value) handleChange("riskLevel", value)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Tender Details"}
          </Button>
        </form>
      </div>
    </div>
  )
}
