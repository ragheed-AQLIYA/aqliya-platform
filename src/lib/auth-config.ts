import "dotenv/config";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { Session } from "next-auth";
import type { OAuthConfig } from "next-auth/providers";
import type { NextRequest } from "next/server";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isOAuthInviteAllowed } from "@/lib/auth/oauth-invite-only";
import { getEnvOAuthProviders } from "@/lib/auth/oauth-env-providers";
import { loadEnabledDbOAuthProviders } from "@/lib/auth/db-oauth-providers";
import {
  sessionCookieName,
  sessionMaxAgeSeconds,
  sessionAuthzRefreshMs,
} from "@/lib/auth/session-cookie";

type NextAuthBundle = ReturnType<typeof NextAuth>;

let nextAuthBundle: NextAuthBundle | null = null;

async function attachUserToToken(
  token: Record<string, unknown>,
  email: string,
): Promise<boolean> {
  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organizationId: true,
      mfaEnabled: true,
      organization: {
        select: { id: true, name: true, platformOrganizationId: true },
      },
    },
  });
  if (!dbUser) return false;
  token.id = dbUser.id;
  token.email = dbUser.email;
  token.name = dbUser.name;
  token.role = dbUser.role;
  token.organizationId = dbUser.organizationId;
  token.organization = dbUser.organization;
  token.platformOrganizationId =
    dbUser.organization?.platformOrganizationId ?? undefined;
  token.mfaEnabled = dbUser.mfaEnabled ?? false;
  token.authzRefreshedAt = Date.now();
  return true;
}

function buildAuthConfig(
  dbOAuthProviders: OAuthConfig<Record<string, unknown>>[],
): NextAuthConfig {
  const maxAge = sessionMaxAgeSeconds();
  return {
    session: { strategy: "jwt", maxAge, updateAge: 60 * 60 },
    secret: process.env.AUTH_SECRET,
    trustHost:
      process.env.NODE_ENV !== "production" ||
      process.env.AUTH_TRUST_HOST === "true",
    cookies: {
      sessionToken: {
        name: sessionCookieName(),
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
    providers: [
      Credentials({
        id: "credentials",
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          const email = String(credentials.email).trim().toLowerCase();

          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              passwordHash: true,
              mfaEnabled: true,
              organizationId: true,
              organization: {
                select: { id: true, name: true, platformOrganizationId: true },
              },
            },
          });

          if (!user || !user.passwordHash) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash,
          );

          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            mfaEnabled: user.mfaEnabled,
            organizationId: user.organizationId,
            organization: user.organization,
            platformOrganizationId:
              user.organization?.platformOrganizationId ?? undefined,
          };
        },
      }),
      ...getEnvOAuthProviders(),
      ...dbOAuthProviders,
    ],
    callbacks: {
      async jwt({ token, user, account, trigger, session }) {
        if (user) {
          const u = user as Record<string, unknown>;
          if (u.organizationId) {
            token.id = u.id;
            token.email = user.email;
            token.name = user.name;
            token.role = u.role;
            token.organizationId = u.organizationId;
            token.organization = u.organization;
            token.platformOrganizationId = u.platformOrganizationId;
            token.mfaEnabled = (u.mfaEnabled as boolean | undefined) ?? false;
            token.mfaVerified = false;
          } else if (user.email) {
            const attached = await attachUserToToken(
              token as Record<string, unknown>,
              user.email,
            );
            if (!attached) return {};
            token.mfaVerified = false;
          }
        } else if (token.email) {
          const refreshedAt = Number(
            (token as Record<string, unknown>).authzRefreshedAt ?? 0,
          );
          const stale =
            !account && Date.now() - refreshedAt > sessionAuthzRefreshMs();
          if (account || stale) {
            const attached = await attachUserToToken(
              token as Record<string, unknown>,
              token.email as string,
            );
            if (!attached) return {};
          }
        }

        // Never promote client-provided session fields into authentication
        // claims. MFA verification is established only by the server-side
        // /api/auth/mfa/verify route, which validates a TOTP or backup code and
        // signs a fresh JWT. A session.update({ mfaVerified: true }) request
        // must not be able to bypass that proof.

        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          Object.assign(session.user, {
            id: token.id,
            email: token.email,
            name: token.name,
            role: token.role,
            organizationId: token.organizationId,
            organization: token.organization,
            platformOrganizationId: token.platformOrganizationId,
            mfaEnabled: token.mfaEnabled ?? false,
            mfaVerified: token.mfaVerified ?? false,
          });
        }
        return session;
      },
      async signIn({ user, account }) {
        if (!account || account.provider === "credentials") return true;
        return isOAuthInviteAllowed(user.email, async (email) =>
          prisma.user.findUnique({
            where: { email },
            select: { id: true },
          }),
        );
      },
    },
    pages: {
      signIn: "/login",
    },
    debug: false,
  };
}

async function ensureNextAuth(): Promise<NextAuthBundle> {
  if (nextAuthBundle) return nextAuthBundle;

  const dbOAuthProviders =
    process.env.NODE_ENV === "test"
      ? []
      : await loadEnabledDbOAuthProviders();

  nextAuthBundle = NextAuth(buildAuthConfig(dbOAuthProviders));
  return nextAuthBundle;
}

/** Warm DB-backed OAuth providers on server startup (instrumentation). */
export async function warmAuthConfig(): Promise<void> {
  await ensureNextAuth();
}

export async function auth(): Promise<Session | null> {
  const bundle = await ensureNextAuth();
  return bundle.auth();
}

export const handlers = {
  GET: (req: NextRequest) =>
    ensureNextAuth().then((bundle) => bundle.handlers.GET(req)),
  POST: (req: NextRequest) =>
    ensureNextAuth().then((bundle) => bundle.handlers.POST(req)),
};

export async function signIn(
  ...args: Parameters<NextAuthBundle["signIn"]>
): ReturnType<NextAuthBundle["signIn"]> {
  const bundle = await ensureNextAuth();
  return bundle.signIn(...args);
}

export async function signOut(
  ...args: Parameters<NextAuthBundle["signOut"]>
): ReturnType<NextAuthBundle["signOut"]> {
  const bundle = await ensureNextAuth();
  return bundle.signOut(...args);
}
