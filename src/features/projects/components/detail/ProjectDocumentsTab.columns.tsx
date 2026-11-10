"use client";

import { DownloadSimpleIcon, EyeIcon } from "@phosphor-icons/react";
import { ActionButton } from "@/components/shared/ActionButton";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import type { ListColumn } from "@/components/shared/list";
import { resolveFileUrl } from "@/lib/upload";
import type { ProjectDocument } from "../../types/project.types";
import { formatDate } from "./project-detail.utils";

export const projectDocumentColumns: ListColumn<ProjectDocument>[] = [
  { id: "type", header: "Type", value: (doc) => doc.type, sortable: true, width: 140 },
  { id: "documentName", header: "Document name", value: (doc) => doc.documentName, isTitle: true, hideable: false, sortable: true, width: 220, grow: true },
  { id: "number", header: "No. / Reference", value: (doc) => doc.number, sortable: true, width: 170 },
  {
    id: "documentDate",
    header: "Document date",
    value: (doc) => doc.documentDate,
    sortable: true,
    width: 140,
    cell: (doc) => formatDate(doc.documentDate),
  },
  { id: "amount", header: "Amount", value: (doc) => doc.amount, width: 120 },
  { id: "fileName", header: "File", value: (doc) => doc.fileName, width: 210 },
];

export const projectDocumentSearchText = (doc: ProjectDocument) =>
  [doc.type, doc.documentName, doc.number, doc.fileName].filter(Boolean).join(" ");

export function ProjectDocumentRowActions({ doc, onDelete }: { doc: ProjectDocument; onDelete: (id: string) => void }) {
  const href = resolveFileUrl(doc.fileUrl);
  return (
    <div className="flex items-center gap-0.5">
      <ActionButton label="Preview" icon={<EyeIcon size={15} />} href={href} disabled={!href} />
      <ActionButton label="Download" icon={<DownloadSimpleIcon size={15} />} href={href} download={doc.fileName || true} disabled={!href} />
      <DeleteConfirmDialog itemName={doc.documentName || doc.fileName || "this document"} onConfirm={() => onDelete(doc.id)} />
    </div>
  );
}
