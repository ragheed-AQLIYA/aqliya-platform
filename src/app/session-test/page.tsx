import { auth } from "@/lib/auth-config"
import { redirect } from "next/navigation"

export default async function SessionTestPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }
  
  return (
    <main className="p-8">
      <h1>Session Test</h1>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </main>
  )
}
