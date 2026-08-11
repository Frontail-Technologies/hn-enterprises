import { useMasterValuesQuery } from "@/features/management/hooks/useMasters";
import { useRosterQuery } from "@/features/management/hooks/useAttendance";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";

// Shared data source for every bulk-edit field control (the general
// BulkEditDialog and the compact BulkQuickFieldDialog both use this) - all
// of these queries are already used elsewhere in the app (CustomerForm,
// etc.), so react-query's cache dedups them; this hook doesn't add any new
// network cost, it just centralizes "what feeds the Supervisor/Plumber/
// Project/Scheme/House Type pickers" in one place.
export function useBulkFieldOptions() {
  const { data: projects = [] } = useProjectsQuery();
  const { data: plumbers = [] } = usePlumbersQuery();
  const { data: supervisors = [] } = useRosterQuery("supervisor");
  const { data: schemes = [] } = useMasterValuesQuery("Schemes");
  const { data: houseTypes = [] } = useMasterValuesQuery("House Types");

  return { projects, plumbers, supervisors, schemes, houseTypes };
}
