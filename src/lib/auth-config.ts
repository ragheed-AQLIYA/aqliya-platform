import "dotenv/config";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
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
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        token.id = u.id;
        token.email = user.email;
        token.name = user.name;
        token.role = u.role;
        token.organizationId = u.organizationId;
        token.organization = u.organization;
        token.platformOrganizationId = u.platformOrganizationId;
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
