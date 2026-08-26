import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Please enter your name"),
  password: z.string().min(1, "Please enter your password"),
});

export type LoginInput = z.infer<typeof loginSchema>;
