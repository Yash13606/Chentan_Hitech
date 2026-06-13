"use server";

import { db } from "@/server/db";
import { signupSchema } from "@/server/validators/auth";
import { hash } from "@node-rs/argon2";
import { Role, IndustryType } from "@/generated/prisma/client";
import { signIn } from "@/server/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { after } from "next/server";
import { sendWelcomeEmail } from "@/server/services/email";

// ─────────────────────────────────────────────────────
// SIGN UP
// ─────────────────────────────────────────────────────

export type SignupState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = signupSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password, phone, companyName, industry, orgSize, city, state } =
    parsed.data;

  // Check for existing user
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // Hash password
  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  // Create company + user in a transaction
  await db.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: companyName,
        industry: industry as IndustryType,
        orgSize: orgSize ?? null,
        city: city ?? null,
        state: state ?? null,
      },
    });

    await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone ?? null,
        role: Role.CUSTOMER,
        companyId: company.id,
      },
    });
  });

  // Fire welcome email after response (non-blocking)
  after(async () => {
    await sendWelcomeEmail({ toEmail: email, customerName: name });
  });

  // Sign in immediately after registration
  await signIn("credentials", {
    email,
    password,
    redirectTo: "/",
  });

  return { success: true };
}

// ─────────────────────────────────────────────────────
// CREDENTIALS LOGIN
// ─────────────────────────────────────────────────────

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: (formData.get("callbackUrl") as string) || "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const msg = (error.cause?.err as any)?.message;
      if (msg === "USER_NOT_FOUND") return { error: "USER_NOT_FOUND" };
      if (msg === "INVALID_PASSWORD") return { error: "INVALID_PASSWORD" };

      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    // Redirect throws — re-throw so Next.js can handle it
    throw error;
  }
  return {};
}

// ─────────────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────────────

export type ForgotState = { error?: string; success?: boolean };

export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required." };

  // Always return success to prevent email enumeration
  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    // TODO: generate reset token, store in VerificationToken, send Resend email
    // This will be wired up in the email service (Phase 7)
    const token = crypto.randomUUID();
    await db.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });
    // sendPasswordResetEmail(email, token) — wired in Phase 7
  }

  return { success: true };
}

// ─────────────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────────────

export async function resetPasswordAction(token: string, password: string) {
  const record = await db.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return { error: "Reset link has expired. Please request a new one." };
  }

  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { email: record.identifier },
      data: { passwordHash },
    });
    await tx.verificationToken.delete({ where: { token } });
  });

  redirect("/login?reset=success");
}
