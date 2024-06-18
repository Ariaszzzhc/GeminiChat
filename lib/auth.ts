import NextAuth, { type NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Github from 'next-auth/providers/github'
import db from './db'

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/signup'
  },
  adapter: PrismaAdapter(db),
  providers: [Github]
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
