import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

const BASE = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const EMAIL = "admin@aqliya.com";
const PASSWORD = "admin123";

const ROUTES = [
  "/sales",
  "/sales/command-center",
  "/sales/accounts",
  "/sales/accounts/sales-acct-001",
  "/sales/opportunities",
  "/sales/opportunities/sales-opp-001",
  "/sales/activities",
  "/sales/intelligence",
  "/sales/icp",
  "/sales/revenue",
  "/platform/commercial",
];

function parseCookies(setCookie: string | null): string {
  if (!setCookie) return "";
  return setCookie
    .split(",")
    .map((part) => part.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

async function login(): Promise<string> {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  const csrfCookies = parseCookies(csrfRes.headers.get("set-cookie"));

  const body = new URLSearchParams({
    csrfToken,
    email: EMAIL,
    password: PASSWORD,
    callbackUrl: `${BASE}/sales`,
    json: "true",
  });

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: csrfCookies,
    },
    body: body.toString(),
    redirect: "manual",
  });

  const loginCookies = parseCookies(loginRes.headers.get("set-cookie"));
  const combined = [csrfCookies, loginCookies].filter(Boolean).join("; ");

  const sessionRes = await fetch(`${BASE}/api/auth/session`, {
    headers: { Cookie: combined },
  });
  const session = await sessionRes.json();
  if (!session?.user?.email) {
    throw new Error(`Login failed: ${JSON.stringify(session)} status=${loginRes.status}`);
  }

  return combined;
}

async function checkRoute(cookie: string, path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Cookie: cookie },
    redirect: "manual",
  });
  const loc = res.headers.get("location") ?? "";
  const html = await res.text();
  const isLogin =
    loc.includes("/login") ||
    (html.includes("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A") &&
      html.includes("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644"));
  const hasError =
    html.includes("Application error") ||
    html.includes("Unhandled Runtime Error") ||
    html.includes("Something went wrong");
  const rtl = html.includes('dir="rtl"') || html.includes("dir='rtl'");
  const hasSpinnerOnly = html.includes("animate-spin") && html.length < 12000;
  const lower = html.toLowerCase();
  const markers = {
    recs: lower.includes("draft") || lower.includes("recommendation"),
    market: lower.includes("market intelligence") || lower.includes("competitor"),
    proof: lower.includes("proof"),
    executive: lower.includes("executive"),
    icp: lower.includes("icp") || lower.includes("fit score"),
    revenue: lower.includes("revenue") || lower.includes("forecast"),
    accounts: lower.includes("acme") || lower.includes("account"),
    opps: lower.includes("opportunit"),
    activities: lower.includes("activit") || lower.includes("meeting"),
    kpi: lower.includes("kpi") || lower.includes("pipeline"),
  };
  const pass =
    res.status === 200 && !isLogin && !hasError && !hasSpinnerOnly && html.length > 5000;

  return {
    path,
    status: res.status,
    redirect: loc || null,
    pass,
    isLogin,
    hasError,
    rtl,
    hasSpinnerOnly,
    htmlLength: html.length,
    markers,
  };
}

async function main() {
  console.log("SalesOS v0.2 SSR smoke base:", BASE);
  const cookie = await login();
  console.log("Login OK");
  for (const path of ROUTES) {
    console.log(JSON.stringify(await checkRoute(cookie, path)));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
