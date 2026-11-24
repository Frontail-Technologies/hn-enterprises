/**
 * A project as a dropdown option. Several projects can share a name (same
 * work, different contractors), so the code, city and contractor go in the
 * secondary line to tell them apart.
 */
export function projectOption(project: { id: string; name: string; code?: string | null; city?: string | null; contractor?: string | null }) {
  const secondary = [project.code, project.city, project.contractor].filter(Boolean).join(" · ");
  return { value: project.id, label: project.name, ...(secondary ? { secondary } : {}) };
}
