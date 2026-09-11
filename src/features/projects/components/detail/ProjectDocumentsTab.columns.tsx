"use client";

import { DownloadSimpleIcon, EyeIcon, TrashIcon } from "@phosphor-icons/react";
import type { ColumnDef } from "@/components/shared/DataTable";
import { ActionButton } from "@/components/shared/ActionButton";
import { resolveFileUrl } from "@/lib/upload";
import type { ProjectDocument } from "../../types/project.types";
import { formatDate } from "./project-detail.utils";

export function buildProjectDocumentColumns(onDelete: (id: string) => void): ColumnDef<ProjectDocument>[] {
  return [
    { key: "type", header: "Type" },
    { key: "documentName", header: "Document Name", className: "min-w-48" },
    { key: "number", header: "No. / Reference", className: "min-w-40" },
    { key: "documentDate", header: "Document Date", render: (doc) => formatDate(doc.documentDate) },
    { key: "amount", header: "Amount" },
    { key: "fileName", header: "File", className: "min-w-52" },
    {
      key: "actions",
      header: "Actions",
      className: "w-64",
      render: (doc) => {
        const href = resolveFileUrl(doc.fileUrl);
        return (
          <div className="flex flex-wrap items-center gap-1">
            <ActionButton label="Preview" icon={<EyeIcon size={13} />} href={href} disabled={!href} />
            <ActionButton
              label="Download"
              icon={<DownloadSimpleIcon size={13} />}
              href={href}
              download={doc.fileName || true}
              disabled={!href}
            />
            <ActionButton label="Delete" icon={<TrashIcon size={13} />} onClick={() => onDelete(doc.id)} />
          </div>
        );
      },
    },
  ];
}
