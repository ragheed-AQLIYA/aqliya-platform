import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <p className="text-muted-foreground">Authentication placeholder</p>
      <Button>Sign In</Button>
    </main>
  )
}
