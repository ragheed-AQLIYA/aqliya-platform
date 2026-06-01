/** Authenticated route smoke — run: npx tsx scripts/smoke-auth-routes.ts */
const base = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const email = process.env.SMOKE_EMAIL ?? "admin@aqliya.com";
const password = process.env.SMOKE_PASSWORD ?? "admin123";

const routes = [
  "/sales",
  "/sales/deals",
  "/sales/accounts",
  "/sales/review",
  "/workflowos",
  "/audit",
];

async function main() {
  const jar = new Map<string, string>();

  function storeCookies(res: Response) {
    const raw = res.headers.getSetCookie?.() ?? [];
    for (const c of raw) {
      const [pair] = c.split(";");
      const eq = pair.indexOf("=");
      if (eq > 0) jar.set(pair.slice(0, eq), pair.slice(eq + 1));
    }
  }

  function cookieHeader() {
    return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  async function fetchWithCookies(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers);
    const c = cookieHeader();
    if (c) headers.set("cookie", c);
    const res = await fetch(`${base}${path}`, { ...init, headers, redirect: "manual" });
    storeCookies(res);
    return res;
  }

  const csrfRes = await fetchWithCookies("/api/auth/csrf");
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const loginRes = await fetchWithCookies("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      callbackUrl: `${base}/`,
      json: "true",
    }),
  });

  console.log("Login:", loginRes.status, loginRes.headers.get("location") ?? "");

  const sessionRes = await fetchWithCookies("/api/auth/session");
  const session = await sessionRes.json();
  console.log("Session user:", session?.user?.email ?? "none");

  console.log("\nRoute smoke (authenticated):");
  for (const route of routes) {
    const res = await fetchWithCookies(route, { redirect: "manual" });
    const status = res.status;
    const pass = status >= 200 && status < 400;
    console.log(`${pass ? "PASS" : "FAIL"} ${route} -> ${status}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
