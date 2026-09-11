import { useMasterValuesQuery } from "@/features/management/hooks/useMasters";
import { usePlumbersQuery } from "@/features/plumbers/hooks/usePlumbers";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";

export function useBulkFieldOptions() {
  const { data: projects = [] } = useProjectsQuery();
  const { data: plumbers = [] } = usePlumbersQuery();
  const { data: schemes = [] } = useMasterValuesQuery("Schemes");
  const { data: houseTypes = [] } = useMasterValuesQuery("House Types");

  return { projects, plumbers, schemes, houseTypes };
}
