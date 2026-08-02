import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/features/projects/services/projects.service";

export function useAllProjectSitesQuery() {
  return useQuery({
    queryKey: ["projects", "all-sites"],
    queryFn: async () => {
      const projects = await projectsApi.list();
      const sitesByProject = await Promise.all(
        projects.map(async (project) => {
          const sites = await projectsApi.listSites(project.id);
          return sites.map((site) => ({ id: site.id, name: `${site.name} (${project.name})` }));
        }),
      );
      return sitesByProject.flat();
    },
  });
}
