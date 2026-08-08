import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/features/projects/services/projects.service";

export function useAllProjectSitesFullQuery() {
  return useQuery({
    queryKey: ["projects", "all-sites", "full"],
    queryFn: async () => {
      const projects = await projectsApi.list();
      const sitesByProject = await Promise.all(projects.map((project) => projectsApi.listSites(project.id)));
      return sitesByProject.flat();
    },
  });
}
