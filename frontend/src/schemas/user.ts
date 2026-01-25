import * as z from "zod";

export const userUpdateSchema = z.object({
  username: z.string().min(1, "Username is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one symbol")
    .optional()
    .or(z.literal("")),
  avatar_url: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
});

export type UserUpdateValues = z.infer<typeof userUpdateSchema>;
