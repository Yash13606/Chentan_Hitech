import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  phone: z.string().optional(),
  // Company fields — required on signup (PRD: no anonymous submissions)
  companyName: z.string().min(2, "Company name is required"),
  industry: z.enum([
    "HOSPITALITY",
    "RESTAURANT",
    "HEALTHCARE",
    "DEFENCE",
    "MARINE",
    "LAUNDRY",
    "EDUCATION",
    "CORPORATE",
    "OTHER",
  ]),
  orgSize: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
