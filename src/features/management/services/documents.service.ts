import { apiRequest } from "@/lib/api-client";

export type DocumentModule = "Projects" | "Customers";

export type DocumentRow = {
  id: string;
  name: string;
  category: string;
  module: DocumentModule;
  relatedName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
};

type BackendDocumentRow = {
  id: string;
  name: string;
  category: string;
  module: DocumentModule;
  relatedName: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
};

function mapDocument(raw: BackendDocumentRow): DocumentRow {
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    module: raw.module,
    relatedName: raw.relatedName,
    fileUrl: raw.fileUrl,
    status: raw.status,
    uploadedAt: raw.uploadedAt,
  };
}

export const documentsApi = {
  async list(params: { search?: string; module?: DocumentModule } = {}): Promise<DocumentRow[]> {
    const query = new URLSearchParams({ limit: "200" });
    if (params.search) query.set("search", params.search);
    if (params.module) query.set("module", params.module);
    const rows = await apiRequest<BackendDocumentRow[]>(`/documents?${query.toString()}`);
    return rows.map(mapDocument);
  },
};
