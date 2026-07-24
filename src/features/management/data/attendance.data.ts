import { format } from "date-fns";

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

export const attendanceRegisterPeople = [
  { id: "st-1", name: "Amit Rathore", placeOfWork: "Shyam Nagar Block B" },
  { id: "st-4", name: "Priya Nair", placeOfWork: "Sunrise Enclave" },
  { id: "st-5", name: "Ramesh Kumar", placeOfWork: "Green City Phase 1" },
  { id: "st-6", name: "Vikas Saini", placeOfWork: "Commercial Block" },
  { id: "st-7", name: "Neha Verma", placeOfWork: "Main Store" },
  { id: "st-8", name: "Group A", placeOfWork: "Shyam Nagar Block A" },
];

function attendanceRecord(
  id: string,
  staffId: string,
  staffName: string,
  date: string,
  status: AttendanceStatus,
  checkInTime?: string,
  checkOutTime?: string,
  workHours?: string,
  latitude?: number,
  longitude?: number,
  locationAddress?: string,
  locationCapturedAt?: string,
  remarks?: string,
): AttendanceRecord {
  return {
    id,
    staffId,
    staffName,
    role: "Supervisor",
    date,
    status,
    checkInTime,
    checkOutTime,
    workHours,
    latitude,
    longitude,
    locationAddress,
    locationCapturedAt,
    remarks,
  };
}

export function buildAttendanceRecords(month: Date): AttendanceRecord[] {
  const monthKey = format(month, "yyyy-MM");

  return [
    attendanceRecord(
      "att-1",
      "st-1",
      "Amit Rathore",
      `${monthKey}-01`,
      "Present",
      "09:12 AM",
      "06:05 PM",
      "8h 53m",
      26.8951,
      75.7684,
      "Shyam Nagar Block B, Jaipur",
      "09:12 AM",
      "Field visit started on time.",
    ),
    attendanceRecord(
      "att-2",
      "st-1",
      "Amit Rathore",
      `${monthKey}-02`,
      "Late",
      "10:05 AM",
      "06:10 PM",
      "8h 05m",
      26.8877,
      75.7592,
      "Green City Phase 1, Jaipur",
      "10:05 AM",
      "Delayed due to client meeting.",
    ),
    attendanceRecord(
      "att-3",
      "st-1",
      "Amit Rathore",
      `${monthKey}-03`,
      "Absent",
      undefined,
      undefined,
      undefined,
      26.9124,
      75.7873,
      "Office marked location, Jaipur",
      "11:00 AM",
      "Approved absence.",
    ),
    attendanceRecord(
      "att-4",
      "st-4",
      "Priya Nair",
      `${monthKey}-04`,
      "Present",
      "09:00 AM",
      "05:45 PM",
      "8h 45m",
      26.9021,
      75.7819,
      "Sunrise Enclave, Jaipur",
      "09:00 AM",
      "Routine supervision.",
    ),
    attendanceRecord(
      "att-5",
      "st-5",
      "Ramesh Kumar",
      `${monthKey}-05`,
      "Half Day",
      "09:30 AM",
      "01:30 PM",
      "4h",
      26.8789,
      75.7421,
      "Commercial Block, Jaipur",
      "09:30 AM",
      "Half-day site handover.",
    ),
    attendanceRecord(
      "att-6",
      "st-4",
      "Priya Nair",
      `${monthKey}-08`,
      "Leave",
      undefined,
      undefined,
      undefined,
      26.8854,
      75.7651,
      "Leave request location, Jaipur",
      "09:15 AM",
      "Personal leave.",
    ),
    attendanceRecord(
      "att-7",
      "st-5",
      "Ramesh Kumar",
      `${monthKey}-12`,
      "Present",
      "09:20 AM",
      "06:00 PM",
      "8h 40m",
      26.8958,
      75.7792,
      "Main Store, Jaipur",
      "09:20 AM",
      "Material reconciliation.",
    ),
  ];
}
