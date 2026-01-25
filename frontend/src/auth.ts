import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { API_V1_URL } from "./lib/constants";
import { authConfig } from "./auth.config";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      username?: string;
      avatar_url?: string;
    } & DefaultSession["user"];
  }

  interface User {
    access_token?: string;
    user_id?: string;
    username?: string;
    avatar_url?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
        token.id = user.user_id;
        token.username = user.username;
        token.avatar_url = user.avatar_url;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.avatar_url = token.avatar_url as string;
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
            // Note: backend returns {access_token, token_type, refresh_token, user: {id, email}}
            return {
              id: data.user.id,
              email: data.user.email,
              access_token: data.access_token,
              user_id: data.user.id,
              // These might not be in the direct login response if not implemented in BE yet, 
              // but we add them for future-proofing or if BE already provides them in user object.
              username: data.user.username,
              avatar_url: data.user.avatar_url,
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
