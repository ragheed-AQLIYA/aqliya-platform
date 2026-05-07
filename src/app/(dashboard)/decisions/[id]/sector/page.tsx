"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getDecisionSectorAction, getSectorsAction, assignSectorToDecisionAction } from "@/actions/decision-sector"
import { getSectorBenchmarksAction } from "@/actions/decision-sector"
import { extractPatternsFromDecisionAction, getDecisionPatternAction } from "@/actions/decision-learning"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Sector = {
  id: string
  name: string
  code: string
  isActive: boolean
}

type SectorBenchmark = {
  id: string
  metricName: string
  value: number
  unit: string
  benchmarkType: string
  sourceType: string
}

type DecisionPattern = {
  patternScope: string
  confidence: number
  extractedAt: Date | string
} | null

export default function DecisionSectorPage() {
  const params = useParams()
  const decisionId = params.id as string

  const [currentSector, setCurrentSector] = useState<{ id: string; name: string } | null>(null)
  const [sectors, setSectors] = useState<Sector[]>([])
  const [benchmarks, setBenchmarks] = useState<SectorBenchmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null)
  const [pattern, setPattern] = useState<DecisionPattern>(null)
  const [extracting, setExtracting] = useState(false)

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const [sectorResult, sectorsResult] = await Promise.all([
          getDecisionSectorAction(decisionId),
          getSectorsAction(),
        ])

        if (sectorResult.error) {
          setError(sectorResult.error)
        } else if (sectorResult.data) {
          const data = sectorResult.data as { sectorId: string | null; sector: Sector | null }
          setCurrentSector(data.sector)
          if (data.sectorId) {
            const benchmarksResult = await getSectorBenchmarksAction(data.sectorId)
            if (benchmarksResult.data) {
              setBenchmarks(benchmarksResult.data as SectorBenchmark[])
            }
          }
        }

        if (sectorsResult.error) {
          setError(sectorsResult.error)
        } else if (sectorsResult.data) {
          setSectors(sectorsResult.data as Sector[])
        }

        // Check if patterns already extracted
        const patternResult = await getDecisionPatternAction(decisionId)
        if (patternResult.data) {
          setPattern(patternResult.data as DecisionPattern)
        }
      } catch {
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleAssign() {
    if (!selectedSectorId) return
    const result = await assignSectorToDecisionAction(decisionId, selectedSectorId)
    if (result.success) {
      // Reload
      const sectorResult = await getDecisionSectorAction(decisionId)
      if (sectorResult.data) {
        const data = sectorResult.data as { sectorId: string | null; sector: Sector | null }
        setCurrentSector(data.sector)
      }
    }
  }

  async function handleExtractPatterns() {
    setExtracting(true)
    const result = await extractPatternsFromDecisionAction(decisionId)
    if (result.success && result.data) {
      // Reload pattern metadata
      const patternResult = await getDecisionPatternAction(decisionId)
      if (patternResult.data) {
        setPattern(patternResult.data as DecisionPattern)
      }
    }
    setExtracting(false)
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sector Assignment</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current Sector</CardTitle>
        </CardHeader>
        <CardContent>
          {currentSector ? (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {currentSector.name}
              </p>
              <Badge>Assigned</Badge>
            </div>
          ) : (
            <p className="text-muted-foreground">No sector assigned</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign Sector</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={(value) => setSelectedSectorId(value)} value={selectedSectorId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors
                .filter((s) => s.isActive)
                .map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAssign} disabled={!selectedSectorId}>
            Assign Sector
          </Button>
        </CardContent>
      </Card>

      {/* Pattern Extraction - Per rules: explicit button, only if gate allows */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern Extraction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pattern ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Patterns already extracted</p>
              <div className="space-y-1">
                <p><strong>Scope:</strong> {pattern.patternScope}</p>
                <p><strong>Confidence:</strong> {pattern.confidence}</p>
                <p><strong>Extracted At:</strong> {new Date(pattern.extractedAt).toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <Button 
              onClick={handleExtractPatterns} 
              disabled={extracting || !currentSector}
            >
              {extracting ? "Extracting..." : "Extract Patterns"}
            </Button>
          )}
        </CardContent>
      </Card>

      {currentSector && benchmarks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Benchmarks for {currentSector.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benchmarks.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.metricName}</TableCell>
                    <TableCell>{b.value}</TableCell>
                    <TableCell>{b.unit}</TableCell>
                    <TableCell>{b.benchmarkType}</TableCell>
                    <TableCell>{b.sourceType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
