import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db, users } from './db';
import { eq } from 'drizzle-orm';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        // For demo purposes, create or find user
        let user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });

        if (!user) {
          // Create new user for demo
          console.log('Creating new user:', credentials.email);
          const [newUser] = await db.insert(users).values({
            email: credentials.email,
            name: credentials.name || credentials.email.split('@')[0],
          }).returning();
          user = newUser;
          console.log('Created user:', user);
        } else {
          console.log('Found existing user:', user);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('JWT callback - user:', user);
        token.id = user.id;
        token.email = user.email;
      }
      console.log('JWT callback - token:', token);
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback - token:', token);
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      console.log('Session callback - session:', session);
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
};

