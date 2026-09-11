"use client";

import type { ColumnDef } from "@/components/shared/DataTable";
import type { TeamRow } from "../../model/team-roster.model";

export const teamColumns: ColumnDef<TeamRow>[] = [
  { key: "name", header: "Name", render: (row) => <span className="font-medium text-foreground">{row.name}</span> },
  { key: "role", header: "Role" },
  { key: "sites", header: "Site / Area" },
  { key: "workload", header: "Workload" },
  { key: "lastActivity", header: "Last Activity" },
];
