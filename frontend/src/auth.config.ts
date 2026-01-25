import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {},
  providers: [], // auth.ts で定義される
} satisfies NextAuthConfig;