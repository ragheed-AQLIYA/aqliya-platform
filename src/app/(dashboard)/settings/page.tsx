import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Ahmed Al-Mansouri" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="ahmed@aqliya.com" />
            </div>
            <Button size="sm">Update Account</Button>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Organization Settings</h2>
          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="orgName">Organization Name</Label>
              <Input id="orgName" defaultValue="AQLIYA" />
            </div>
            <Button size="sm">Update Organization</Button>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">System Preferences</h2>
          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Input id="language" defaultValue="English" disabled />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="Asia/Riyadh" disabled />
            </div>
            <p className="text-xs text-muted-foreground">Additional preferences coming soon</p>
          </Card>
        </section>
      </div>
    </main>
  )
}
