import { z } from "zod"

const authEmailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .pipe(z.email("Please provide a valid email address"))

const signInCredentialsSchema = z.object({
  email: authEmailSchema,
  password: z.string().min(1, "Password is required"),
})

const signUpCredentialsSchema = z.object({
  email: authEmailSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
})

export { signInCredentialsSchema, signUpCredentialsSchema }
