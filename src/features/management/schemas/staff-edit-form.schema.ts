import { z } from "zod";
import type { UserRole, UserStatus } from "../services/users.service";
import type { StaffDesignation, StaffPaymentAccountType, StaffSalaryType } from "../types/staff.types";

export function buildStaffEditFormSchema() {
  return z.object({
    designation: z.custom<StaffDesignation>(),
    name: z.string().trim().min(1, "Name is required"),
    mobile: z.string(),
    role: z.custom<UserRole>(),
    status: z.custom<UserStatus>(),
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
    /** Profile photo URL ("" = none). */
    avatarUrl: z.string(),
  });
}

export type StaffEditFormValues = z.infer<ReturnType<typeof buildStaffEditFormSchema>>;
