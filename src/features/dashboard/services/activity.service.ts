/**
 * Activity type union for the dashboard OVERVIEW card (`RecentActivityCard`),
 * which is fed by the dashboard overview endpoint - not the Recent Activity
 * page. The page's old client-side merge/sort (`buildActivities` /
 * `getActivityRows`) was removed in favour of the server `GET /activity`
 * read model; see `recent-activity.api.ts` / `useRecentActivityQuery.ts`.
 */
export type ActivityType = "Work" | "Survey" | "DPR" | "Billing" | "System";
