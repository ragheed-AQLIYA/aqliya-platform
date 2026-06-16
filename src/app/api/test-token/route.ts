import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request: Request) {
  const secret = process.env.AUTH_SECRET;
  const token = await getToken({ req: request, secret, salt: "authjs.session-token" });
  const token2 = await getToken({ req: request, secret, salt: "next-auth.session-token" });
  
  return NextResponse.json({
    token,
    token2,
    cookies: request.headers.get("cookie"),
  });
}
