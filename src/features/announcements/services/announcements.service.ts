import type { Announcement } from "../types/announcement.types";

export const announcements: Announcement[] = [
  {
    id: "ann-001",
    title: "Holiday Notice: Republic Day",
    message: "Field offices and stores will remain closed on 26th January. Emergency contact numbers are shared in the office group.",
    status: "Sent",
    createdBy: "Demo Admin",
    createdOn: "2025-02-10",
    sentOn: "2025-02-10",
  },
  {
    id: "ann-002",
    title: "New Safety Checklist for GC Work",
    message: "An updated safety checklist is mandatory before starting any GC excavation. Please review it in the Reports section before your next site visit.",
    status: "Sent",
    createdBy: "Demo Admin",
    createdOn: "2025-02-15",
    sentOn: "2025-02-16",
  },
  {
    id: "ann-003",
    title: "Material Rate Revision - February",
    message: "Vendor rates for GI pipes and brass fittings have been revised. Check the Inventory module for updated purchase rates before raising new material requests.",
    status: "Draft",
    createdBy: "Demo Admin",
    createdOn: "2025-02-18",
  },
];
