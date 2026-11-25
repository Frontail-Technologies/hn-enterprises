import type { UserRole, UserStatus } from "../services/users.service";

/** Job title. Only supervisors have an app login. */
export type StaffDesignation =
  | "Supervisor"
  | "Site Manager"
  | "Project Manager"
  | "Driver"
  | "Jointer"
  | "Helper"
  | "Operator"
  | "Store Incharge";

export const STAFF_DESIGNATIONS: StaffDesignation[] = [
  "Supervisor",
  "Site Manager",
  "Project Manager",
  "Driver",
  "Jointer",
  "Helper",
  "Operator",
  "Store Incharge",
];

export type StaffSalaryType = "Monthly" | "Daily Wage" | "Work Basis" | "Contract";
export type StaffPaymentAccountType = "Bank Account" | "UPI" | "Cash" | "Other";

export type Staff = {
  id: string;
  /** "" for staff without an app login. */
  userId: string;
  designation: StaffDesignation;
  /** Supervisors have a login account; everyone else has none. */
  hasLogin: boolean;
  name: string;
  username: string;
  email: string;
  contact: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  /** Profile photo URL ("" = none). */
  avatarUrl: string;
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
  /** Sent only for staff without a login (a supervisor stays a supervisor). */
  designation?: StaffDesignation;
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
  designation: StaffDesignation;
  /** Profile photo URL (already uploaded); "" = none. */
  avatarUrl: string;
  /** Supervisors only: link an existing login or create one. Others use newUser.name / newUser.mobile. */
  mode: "existing" | "new";
  userId: string;
  newUser: NewStaffUserFormValues;
};

export type StaffUserPatchValues = {
  name: string;
  mobile: string;
  /** "" removes the photo. */
  avatarUrl: string;
  role: UserRole;
  status: UserStatus;
};
