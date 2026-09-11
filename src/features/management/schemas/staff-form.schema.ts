import { z } from "zod";
import type { UserRole } from "../services/users.service";
import type { CreateStaffFormValues, StaffPaymentAccountType, StaffSalaryType } from "../types/staff.types";

export function buildStaffFormSchema() {
  return z
    .object({
      mode: z.enum(["existing", "new"]),
      userId: z.string(),
      newUser: z.object({
        name: z.string(),
        email: z.string(),
        username: z.string(),
        mobile: z.string(),
        role: z.custom<UserRole>(),
        password: z.string(),
      }),
      assignedProjectId: z.string(),
      salaryType: z.custom<StaffSalaryType>(),
      monthlySalary: z.string(),
      allowance: z.string(),
      paymentAccountType: z.custom<StaffPaymentAccountType>(),
      bankType: z.string(),
      bankName: z.string(),
      accountHolderName: z.string(),
      accountNumber: z.string(),
      ifscCode: z.string(),
      upiType: z.string(),
      upiId: z.string(),
      salaryEffectiveFrom: z.string(),
      lastSalaryRevisionDate: z.string(),
      nextSalaryReviewDate: z.string(),
      remarks: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.mode === "existing" && !values.userId) {
        ctx.addIssue({ code: "custom", path: ["userId"], message: "Select a user to link" });
      }
      if (values.mode === "new") {
        if (!values.newUser.name.trim()) {
          ctx.addIssue({ code: "custom", path: ["newUser", "name"], message: "Name is required" });
        }
        if (!values.newUser.username.trim()) {
          ctx.addIssue({ code: "custom", path: ["newUser", "username"], message: "Username is required" });
        }
        if (!values.newUser.email.trim()) {
          ctx.addIssue({ code: "custom", path: ["newUser", "email"], message: "Email is required" });
        }
        if (values.newUser.password.length < 8) {
          ctx.addIssue({ code: "custom", path: ["newUser", "password"], message: "Password must be at least 8 characters" });
        }
      }
    });
}

export type { CreateStaffFormValues };
