import { useQuery } from "@tanstack/react-query";
import { documentsApi, type DocumentModule } from "../services/documents.service";

export function useDocumentsQuery(params: { search?: string; module?: DocumentModule } = {}) {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: () => documentsApi.list(params),
  });
}
