import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { API_V1_URL } from "./lib/constants";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      username?: string;
      avatarUrl?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    accessToken?: string;
    username?: string;
    avatarUrl?: string;
  }

  interface JWT {
    id: string;
    accessToken?: string;
    username?: string;
    avatarUrl?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.username = user.username;
        token.avatarUrl = user.avatarUrl;
      }
      
      if (trigger === "update" && session) {
        token.username = session.username || token.username;
        token.avatarUrl = session.avatarUrl || token.avatarUrl;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.avatarUrl = token.avatarUrl as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await fetch(`${API_V1_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data.access_token) {
            // Map backend response (snake_case) to our User model (camelCase)
            const user = data.user;
            const metadata = user.user_metadata || user.raw_user_meta_data || {};
            
            return {
              id: user.id,
              email: user.email,
              accessToken: data.access_token,
              username: metadata.username || user.username,
              avatarUrl: metadata.avatar_url || user.avatar_url,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth Error:", error);
          return null;
        }
      },
    }),
  ],
});