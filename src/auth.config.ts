import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET,
      authorization: { params: { scope: "read:user user:email repo" } },
    }),
  ],
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session as any).accessToken = token.accessToken;
        if (token.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise false
      return !!auth;
    },
  },
} satisfies NextAuthConfig;
