import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
 
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
              select: { id: true, name: true }
            }
          }
        })
 
        if (!user || !user.passwordHash) return null
 
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
 
        if (!isValid) return null
 
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organization: user.organization,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.email = user.email
        token.name = user.name
        token.role = (user as any).role
        token.organizationId = (user as any).organizationId
        token.organization = (user as any).organization
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id
        (session.user as any).email = token.email
        (session.user as any).name = token.name
        (session.user as any).role = token.role
        (session.user as any).organizationId = token.organizationId
        (session.user as any).organization = token.organization
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: true, // Enable debug to see what's happening
}

export const { auth, handlers, signIn: nextSignIn, signOut } = NextAuth(authConfig)

