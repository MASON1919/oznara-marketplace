import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import GithubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
export const runtime = "nodejs";

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "text", placeholder: "you@example.com" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }
        if (
          user &&
          (await bcrypt.compare(credentials.password, user.password))
        ) {
          return user;
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_ID,
      clientSecret: process.env.GOOGLE_OAUTH_SECRET,
      authorization: {
        params: {
          prompt: "select_account", // 매번 계정 선택창 강제
        },
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: { params: { scope: "read:user user:email" } },
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: "identify email" } },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "credentials") {
        return true; // 크리덴셜 로그인은 그냥 통과
      }
      if (account?.provider === "google" && profile?.email) {
        const email = String(profile.email).toLowerCase();
        await prisma.user.upsert({
          where: { email },
          create: {
            email,
            name: profile.name ?? null,
            image: profile.picture ?? null,
          },
          update: {
            image: profile.picture ?? null,
          },
        });
      }
      if (account?.provider === "github" && profile?.email) {
        const email = String(profile.email).toLowerCase();
        await prisma.user.upsert({
          where: { email },
          create: {
            email,
            name: profile.name ?? null,
            image: profile.picture ?? null,
          },
          update: {
            image: profile.picture ?? null,
          },
        });
      }
      if (account?.provider === "discord" && profile?.email) {
        const email = String(profile.email).toLowerCase();
        await prisma.user.upsert({
          where: { email },
          create: {
            email,
            name: profile.name ?? null,
            image: profile.picture ?? null,
          },
          update: {
            image: profile.picture ?? null,
          },
        });
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === "google" && profile?.email) {
        const email = String(profile.email).toLowerCase();
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });
        if (dbUser) token.sub = dbUser.id;
      } else if (account?.provider === "github" && profile?.email) {
        const email = String(profile.email).toLowerCase();
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (dbUser) token.sub = dbUser.id;
      } else if (account?.provider === "discord" && profile?.email) {
        const email = String(profile.email).toLowerCase();
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });
        if (dbUser) token.sub = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
