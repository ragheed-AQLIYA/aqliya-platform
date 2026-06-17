import "dotenv/config";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isOAuthInviteAllowed } from "@/lib/auth/oauth-invite-only";
import { getEnvOAuthProviders } from "@/lib/auth/oauth-env-providers";
import { loadEnabledDbOAuthProviders } from "@/lib/auth/db-oauth-providers";

const dbOAuthProviders = await loadEnabledDbOAuthProviders();

async function attachUserToToken(
  token: Record<string, unknown>,
  email: string,
): Promise<void> {
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
  if (!dbUser) return;
  token.id = dbUser.id;
  token.email = dbUser.email;
  token.name = dbUser.name;
  token.role = dbUser.role;
  token.organizationId = dbUser.organizationId;
  token.organization = dbUser.organization;
  token.platformOrganizationId =
    dbUser.organization?.platformOrganizationId ?? undefined;
  token.mfaEnabled = dbUser.mfaEnabled ?? false;
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
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
          await attachUserToToken(
            token as Record<string, unknown>,
            user.email,
          );
          token.mfaVerified = false;
        }
      } else if (account && token.email) {
        await attachUserToToken(
          token as Record<string, unknown>,
          token.email as string,
        );
      }

      if (trigger === "update" && session) {
        const sessionPatch = session as Record<string, unknown>;
        if (sessionPatch.mfaVerified === true) {
          token.mfaVerified = true;
        }
        if (typeof sessionPatch.mfaEnabled === "boolean") {
          token.mfaEnabled = sessionPatch.mfaEnabled;
        }
      }

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

export const {
  auth,
  handlers,
  signIn: nextSignIn,
  signOut,
} = NextAuth(authConfig);
