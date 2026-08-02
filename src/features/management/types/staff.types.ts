import type { UserRole, UserStatus } from "../services/users.service";

export type StaffSalaryType = "Monthly" | "Daily Wage" | "Work Basis" | "Contract";
export type StaffPaymentAccountType = "Bank Account" | "UPI" | "Cash" | "Other";

export type Staff = {
  id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  contact: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  assignedProjectId: string;
  salaryType: StaffSalaryType;
  monthlySalary: string;
  allowance: string;
  paymentAccountType: StaffPaymentAccountType;
  bankType: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiType: string;
  upiId: string;
  salaryEffectiveFrom: string;
  lastSalaryRevisionDate: string;
  nextSalaryReviewDate: string;
  remarks: string;
};

export type StaffPayrollFormValues = {
  assignedProjectId: string;
  salaryType: StaffSalaryType;
  monthlySalary: string;
  allowance: string;
  paymentAccountType: StaffPaymentAccountType;
  bankType: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiType: string;
  upiId: string;
  salaryEffectiveFrom: string;
  lastSalaryRevisionDate: string;
  nextSalaryReviewDate: string;
  remarks: string;
};

export type NewStaffUserFormValues = {
  name: string;
  email: string;
  username: string;
  mobile: string;
  role: UserRole;
  password: string;
};

export type CreateStaffFormValues = StaffPayrollFormValues & {
  mode: "existing" | "new";
  userId: string;
  newUser: NewStaffUserFormValues;
};

export type StaffUserPatchValues = {
  name: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
};
