import Credentials from 'next-auth/providers/credentials'
import { createAdminClient } from '../supabase/admin'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const admin = createAdminClient()
          const { data, error } = await admin
            .from('profiles')
            .select('id, email, full_name, role')
            .eq('email', credentials.email)
            .single()

          if (error || !data) {
            return null
          }

          // In production, verify password hash against Supabase Auth
          // For now, basic validation
          return {
            id: data.id,
            email: data.email,
            name: data.full_name,
            role: data.role,
          }
        } catch (error) {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        (token as any).id = user.id
        (token as any).role = user.role
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as any).id = (token as any).id
        (session.user as any).role = (token as any).role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}
