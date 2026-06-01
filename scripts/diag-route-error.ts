const base = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const routes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/sales/review", "/workflowos", "/audit"];

async function diag(route: string) {
  const jar: string[] = [];
  function sc(r: Response) {
    for (const c of r.headers.getSetCookie()) jar.push(c.split(";")[0]);
  }
  let r = await fetch(`${base}/api/auth/csrf`);
  sc(r);
  const { csrfToken } = (await r.json()) as { csrfToken: string };
  r = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: jar.join("; "),
    },
    body: new URLSearchParams({
      csrfToken,
      email: "admin@aqliya.com",
      password: "admin123",
      callbackUrl: `${base}/`,
      json: "true",
    }),
    redirect: "manual",
  });
  sc(r);
  r = await fetch(`${base}${route}`, {
    headers: { cookie: jar.join("; ") },
    redirect: "manual",
  });
  const t = await r.text();
  const dataMatch = t.match(/__NEXT_DATA__[^>]+>(\{.*?\})<\/script/s);
  if (dataMatch) {
    try {
      const data = JSON.parse(dataMatch[1]);
      console.log(route, r.status, data?.props?.pageProps?.err?.message?.slice(0, 300) ?? "no err");
      return;
    } catch {
      /* fall through */
    }
  }
  console.log(route, r.status, t.slice(0, 200));
}

(async () => {
  for (const route of routes) await diag(route);
})();
