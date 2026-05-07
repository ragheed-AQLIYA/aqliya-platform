"use client"

import { useEffect, useState } from "react"
import { getSectorsAction, createSectorAction } from "@/actions/decision-sector"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  description: string | null
  code: string
  isActive: boolean
  _count: {
    decisions: number
    benchmarks: number
  }
}

export default function SectorsPage() {
  const router = useRouter()
  const [sectors, setSectors] = useState<Sector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [code, setCode] = useState("")

  useEffect(() => {
    const loadSectors = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await getSectorsAction()
        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setSectors(result.data as Sector[])
        }
      } catch {
        setError("Failed to load sectors")
      } finally {
        setLoading(false)
      }
    }

    loadSectors()
  }, [])

  async function handleSubmit(formData: FormData) {
    const result = await createSectorAction(formData)
    if (result.success) {
      setShowForm(false)
      setName("")
      setDescription("")
      setCode("")
      // Reload
      const result = await getSectorsAction()
      if (result.data) {
        setSectors(result.data as Sector[])
      }
    }
  }

  if (loading) return <div className="p-6">Loading sectors...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sectors</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Sector"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" value={code} onChange={(e) => setCode(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button type="submit">Create Sector</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Decisions</TableHead>
                <TableHead>Benchmarks</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectors.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell>{sector.name}</TableCell>
                  <TableCell>{sector.code}</TableCell>
                  <TableCell>
                    <span className={sector.isActive ? "text-green-600" : "text-gray-400"}>
                      {sector.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>{sector._count.decisions}</TableCell>
                  <TableCell>{sector._count.benchmarks}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/intelligence/sectors/${sector.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
