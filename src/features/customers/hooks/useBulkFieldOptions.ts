import { useMasterValuesQuery } from "@/features/management/hooks/useMasters";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { onlyPlumbers } from "@/features/plumbers/utils/plumber-label";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";

export function useBulkFieldOptions() {
  const { data: projects = [] } = useProjectsQuery();
  const { data: roster = [] } = usePlumbersQuery();
  // A customer's plumber is never labour.
  const plumbers = onlyPlumbers(roster);
  const { data: schemes = [] } = useMasterValuesQuery("Schemes");
  const { data: houseTypes = [] } = useMasterValuesQuery("House Types");

  return { projects, plumbers, schemes, houseTypes };
}
