import { apiRequest } from "./api-client";

export type UploadedFile = {
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
};

export async function uploadFile(file: File, module: string, recordId?: string): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("module", module);
  if (recordId) formData.append("recordId", recordId);

  return apiRequest<UploadedFile>("/uploads", {
    method: "POST",
    body: formData,
  });
}

export function resolveFileUrl(url: string | null | undefined) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const origin = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005/api").replace(/\/api\/?$/, "");
  return `${origin}${url.startsWith("/") ? "" : "/"}${url}`;
}
