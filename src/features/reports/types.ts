/** Filters shared by every report tab. Dates are yyyy-MM-dd (inclusive). */
export type ReportFilters = {
  from: string;
  to: string;
  /** Empty = all projects the user can see. */
  projectId: string;
};
