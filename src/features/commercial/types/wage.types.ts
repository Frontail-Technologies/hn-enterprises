export type WageCategory = "High Skilled" | "Skilled" | "Unskilled";
export type WageStatus = "Pending" | "Approved" | "Paid";

export type WageRecord = {
  id: string;
  plumberId: string;
  month: string;
  category: WageCategory;
  wageRate: number;
  daysWorked: number;
  basic: number;
  total: number;
  pf: number;
  esic: number;
  totalDeduction: number;
  netPayment: number;
  status: WageStatus;
  remarks: string;
};

export type WageFormValues = {
  plumberId: string;
  month: string;
  category: WageCategory;
  wageRate: string;
  daysWorked: string;
  pf: string;
  esic: string;
  status: WageStatus;
  remarks: string;
};
