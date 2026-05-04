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

export default function NewDecisionPage() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Decision</h1>
      <form className="space-y-4">
        <div>
          <Label htmlFor="title">Decision Title</Label>
          <Input id="title" placeholder="Enter decision title" />
        </div>
        <div>
          <Label htmlFor="type">Decision Type</Label>
          <Select defaultValue="TENDER">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TENDER">Tender</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="objectives">Objectives</Label>
          <Textarea id="objectives" placeholder="Define objectives" />
        </div>
        <div>
          <Label htmlFor="constraints">Constraints</Label>
          <Textarea id="constraints" placeholder="List constraints" />
        </div>
        <Button type="submit">Create Decision</Button>
      </form>
    </main>
  )
}
