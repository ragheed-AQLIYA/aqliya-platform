import "dotenv/config";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isOAuthInviteAllowed } from "@/lib/auth/oauth-invite-only";
import { getEnvOAuthProviders } from "@/lib/auth/oauth-env-providers";

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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
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
          organizationId: user.organizationId,
          organization: user.organization,
          platformOrganizationId:
            user.organization?.platformOrganizationId ?? undefined,
        };
      },
    }),
    ...getEnvOAuthProviders(),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
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
        } else if (user.email) {
          await attachUserToToken(
            token as Record<string, unknown>,
            user.email,
          );
        }
      } else if (account && token.email) {
        await attachUserToToken(
          token as Record<string, unknown>,
          token.email as string,
        );
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
