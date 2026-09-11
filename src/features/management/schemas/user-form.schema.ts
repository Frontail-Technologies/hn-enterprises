import { z } from "zod";
import type { UserRole, UserStatus } from "../services/users.service";

export function buildUserFormSchema(mode: "create" | "edit") {
  return z
    .object({
      name: z.string(),
      username: z.string(),
      email: z.string(),
      mobile: z.string(),
      role: z.custom<UserRole>(),
      status: z.custom<UserStatus>(),
      password: z.string(),
      newPassword: z.string(),
    })
    .superRefine((values, ctx) => {
      if (!values.name.trim()) {
        ctx.addIssue({ code: "custom", path: ["name"], message: "Name is required" });
      }
      if (!values.username.trim()) {
        ctx.addIssue({ code: "custom", path: ["username"], message: "Username is required" });
      }
      if (!values.email.trim()) {
        ctx.addIssue({ code: "custom", path: ["email"], message: "Email is required" });
      }
      if (mode === "create" && values.password.length < 8) {
        ctx.addIssue({ code: "custom", path: ["password"], message: "Password must be at least 8 characters" });
      }
    });
}

export type UserFormValues = z.infer<ReturnType<typeof buildUserFormSchema>>;
