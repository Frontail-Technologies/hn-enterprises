import { apiRequest } from "@/lib/api-client";
import {
  ROLE_TO_BACKEND,
  ROLE_TO_FRONTEND,
  STATUS_TO_BACKEND,
  STATUS_TO_FRONTEND,
  type BackendRole,
  type BackendStatus,
} from "./users.service";
import type {
  CreateStaffFormValues,
  Staff,
  StaffPaymentAccountType,
  StaffPayrollFormValues,
  StaffSalaryType,
  StaffUserPatchValues,
} from "../types/staff.types";

type BackendSalaryType = "monthly" | "daily_wage" | "work_basis" | "contract";
type BackendPaymentAccountType = "bank_account" | "upi" | "cash" | "other";

const SALARY_TYPE_TO_FRONTEND: Record<BackendSalaryType, StaffSalaryType> = {
  monthly: "Monthly",
  daily_wage: "Daily Wage",
  work_basis: "Work Basis",
  contract: "Contract",
};

const SALARY_TYPE_TO_BACKEND: Record<StaffSalaryType, BackendSalaryType> = {
  Monthly: "monthly",
  "Daily Wage": "daily_wage",
  "Work Basis": "work_basis",
  Contract: "contract",
};

const PAYMENT_ACCOUNT_TYPE_TO_FRONTEND: Record<BackendPaymentAccountType, StaffPaymentAccountType> = {
  bank_account: "Bank Account",
  upi: "UPI",
  cash: "Cash",
  other: "Other",
};

const PAYMENT_ACCOUNT_TYPE_TO_BACKEND: Record<StaffPaymentAccountType, BackendPaymentAccountType> = {
  "Bank Account": "bank_account",
  UPI: "upi",
  Cash: "cash",
  Other: "other",
};

function toDateOnly(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

type BackendStaff = {
  id: string;
  userId: string;
  assignedProjectId: string | null;
  salaryType: BackendSalaryType;
  monthlySalary: string;
  allowance: string;
  paymentAccountType: BackendPaymentAccountType;
  bankType: string | null;
  bankName: string | null;
  accountHolderName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  upiType: string | null;
  upiId: string | null;
  salaryEffectiveFrom: string | null;
  lastSalaryRevisionDate: string | null;
  nextSalaryReviewDate: string | null;
  remarks: string | null;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    mobile: string | null;
    role: BackendRole;
    status: BackendStatus;
    lastLoginAt: string | null;
  };
};

function mapStaff(raw: BackendStaff): Staff {
  return {
    id: raw.id,
    userId: raw.userId,
    name: raw.user.name,
    username: raw.user.username,
    email: raw.user.email,
    contact: raw.user.mobile ?? "",
    role: ROLE_TO_FRONTEND[raw.user.role] ?? "Viewer",
    status: STATUS_TO_FRONTEND[raw.user.status] ?? "Active",
    lastLogin: raw.user.lastLoginAt ?? "",
    assignedProjectId: raw.assignedProjectId ?? "",
    salaryType: SALARY_TYPE_TO_FRONTEND[raw.salaryType] ?? "Monthly",
    monthlySalary: raw.monthlySalary,
    allowance: raw.allowance,
    paymentAccountType: PAYMENT_ACCOUNT_TYPE_TO_FRONTEND[raw.paymentAccountType] ?? "Bank Account",
    bankType: raw.bankType ?? "",
    bankName: raw.bankName ?? "",
    accountHolderName: raw.accountHolderName ?? "",
    accountNumber: raw.accountNumber ?? "",
    ifscCode: raw.ifscCode ?? "",
    upiType: raw.upiType ?? "",
    upiId: raw.upiId ?? "",
    salaryEffectiveFrom: toDateOnly(raw.salaryEffectiveFrom),
    lastSalaryRevisionDate: toDateOnly(raw.lastSalaryRevisionDate),
    nextSalaryReviewDate: toDateOnly(raw.nextSalaryReviewDate),
    remarks: raw.remarks ?? "",
  };
}

function mapPayrollToBody(values: StaffPayrollFormValues) {
  return {
    assignedProjectId: values.assignedProjectId || undefined,
    salaryType: SALARY_TYPE_TO_BACKEND[values.salaryType],
    monthlySalary: Number(values.monthlySalary) || 0,
    allowance: Number(values.allowance) || 0,
    paymentAccountType: PAYMENT_ACCOUNT_TYPE_TO_BACKEND[values.paymentAccountType],
    bankType: values.bankType || undefined,
    bankName: values.bankName || undefined,
    accountHolderName: values.accountHolderName || undefined,
    accountNumber: values.accountNumber || undefined,
    ifscCode: values.ifscCode || undefined,
    upiType: values.upiType || undefined,
    upiId: values.upiId || undefined,
    salaryEffectiveFrom: values.salaryEffectiveFrom || undefined,
    lastSalaryRevisionDate: values.lastSalaryRevisionDate || undefined,
    nextSalaryReviewDate: values.nextSalaryReviewDate || undefined,
    remarks: values.remarks || undefined,
  };
}

export const staffApi = {
  async list(params: { search?: string; role?: string; status?: string } = {}): Promise<Staff[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.search) query.set("search", params.search);
    const rows = await apiRequest<BackendStaff[]>(`/staff?${query.toString()}`);
    return rows.map(mapStaff);
  },

  async get(id: string): Promise<Staff> {
    const raw = await apiRequest<BackendStaff>(`/staff/${id}`);
    return mapStaff(raw);
  },

  async create(values: CreateStaffFormValues): Promise<Staff> {
    const body =
      values.mode === "existing"
        ? { userId: values.userId, ...mapPayrollToBody(values) }
        : {
            newUser: {
              name: values.newUser.name,
              email: values.newUser.email,
              username: values.newUser.username,
              mobile: values.newUser.mobile || undefined,
              role: ROLE_TO_BACKEND[values.newUser.role],
              password: values.newUser.password,
            },
            ...mapPayrollToBody(values),
          };

    const raw = await apiRequest<BackendStaff>("/staff", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return mapStaff(raw);
  },

  async update(id: string, values: StaffPayrollFormValues, userPatch?: Partial<StaffUserPatchValues>): Promise<Staff> {
    const body: Record<string, unknown> = mapPayrollToBody(values);
    if (userPatch && Object.keys(userPatch).length) {
      body.user = {
        name: userPatch.name,
        mobile: userPatch.mobile || undefined,
        role: userPatch.role ? ROLE_TO_BACKEND[userPatch.role] : undefined,
        status: userPatch.status ? STATUS_TO_BACKEND[userPatch.status] : undefined,
      };
    }

    const raw = await apiRequest<BackendStaff>(`/staff/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return mapStaff(raw);
  },

  async delete(id: string): Promise<void> {
    await apiRequest(`/staff/${id}`, {
      method: "DELETE",
    });
  },
};
