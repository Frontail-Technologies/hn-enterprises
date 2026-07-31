export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Late"
  | "Half Day"
  | "Leave"
  | "Not Marked";

export type AttendanceRecord = {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  workHours?: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  locationCapturedAt?: string;
  remarks?: string;
};

export type AttendanceViewMode = "calendar" | "register";
