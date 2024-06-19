import NextAuth, { type NextAuthConfig } from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Github from 'next-auth/providers/github'
import db from './db'

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login'
  },
  adapter: DrizzleAdapter(db),
  providers: [Github]
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
