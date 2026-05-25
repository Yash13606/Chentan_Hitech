import "server-only";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { Role } from "@/generated/prisma/client";
import { z } from "zod";

// ─────────────────────────────────────────────────────
// NOTE: Auth.js v5 (next-auth@beta 5.0.0-beta.31)
// Session strategy: JWT (no DB hit per request at 1k DAU)
// Custom claims: id, role, companyId stored in JWT
// ─────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            companyId: true,
            emailVerified: true,
          },
        });

        if (!user?.passwordHash) return null;

        // Lazy import argon2 to avoid issues in edge environments
        const { verify } = await import("@node-rs/argon2");
        const valid = await verify(user.passwordHash, parsed.data.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
        };
      },
    }),
  ],

  callbacks: {
    // Persist custom claims in the JWT
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? Role.CUSTOMER;
        token.companyId = (user as { companyId?: string | null }).companyId ?? null;
      }

      // On session update, refresh role from DB (e.g. after admin promotes user)
      if (trigger === "update" && token.id) {
        const fresh = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, companyId: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.companyId = fresh.companyId;
        }
      }

      return token;
    },

    // Expose JWT claims in the session object (client-visible)
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: Role }).role = token.role as Role;
        (session.user as { companyId?: string | null }).companyId =
          token.companyId as string | null;
      }
      return session;
    },

    // Auto-provision Company on first Google OAuth sign-in
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.id) {
        const existing = await db.user.findUnique({
          where: { id: user.id },
          select: { companyId: true },
        });
        if (!existing?.companyId) {
          const company = await db.company.create({
            data: { name: user.name ?? "My Company" },
          });
          await db.user.update({
            where: { id: user.id },
            data: { companyId: company.id, role: Role.CUSTOMER },
          });
        }
      }
      return true;
    },
  },
});

// ─────────────────────────────────────────────────────
// Type augmentation — extend the default Session type
// ─────────────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      companyId?: string | null;
    };
  }
}
