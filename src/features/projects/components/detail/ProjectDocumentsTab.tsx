"use client";

import { useState } from "react";
import { FileArrowUpIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { SectionCard } from "@/components/shared/SectionCard";
import {
  useCreateProjectDocument,
  useDeleteProjectDocument,
  useProjectDocumentsQuery,
} from "@/features/projects/hooks/useProjects";
import type { ProjectDocument } from "../../types/project.types";
import { documentCategories, emptyDocument } from "./project-document.constants";
import { buildProjectDocumentColumns } from "./ProjectDocumentsTab.columns";
import { ProjectDocumentDialog } from "./ProjectDocumentDialog";
import { ProjectTabHeader } from "./ProjectTabHeader";

export function ProjectDocumentsTab({ projectId }: { projectId: string }) {
  const { data: documents = [], isLoading } = useProjectDocumentsQuery(projectId);
  const createDocumentMutation = useCreateProjectDocument(projectId);
  const deleteDocumentMutation = useDeleteProjectDocument(projectId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<ProjectDocument>(emptyDocument);

  const columns = buildProjectDocumentColumns((id) => deleteDocumentMutation.mutate(id));

  const saveDocument = async () => {
    if (!draft.type || !draft.number) return;
    await createDocumentMutation.mutateAsync(draft);
    setDialogOpen(false);
    setDraft(emptyDocument);
  };

  return (
    <div className="space-y-5">
      <ProjectTabHeader title="Documents" subtitle="Contracts, drawings and other project records" />

      <SectionCard
        title="Document Categories"
        action={
          <Button
            size="sm"
            onClick={() => {
              setDraft(emptyDocument);
              setDialogOpen(true);
            }}
          >
            <FileArrowUpIcon size={14} />
            Upload Document
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {documentCategories.map((category) => (
            <button
              key={category.type}
              className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-4 text-center text-sm font-semibold text-foreground hover:border-primary hover:bg-primary/5"
              onClick={() => {
                setDraft({
                  ...emptyDocument,
                  category: category.type,
                  type: category.type,
                  documentName: `${category.label} Document`,
                });
                setDialogOpen(true);
              }}
            >
              <FileArrowUpIcon size={20} className="mx-auto mb-2 text-primary" />
              {category.label}
              <span className="mt-1 block text-xs font-medium text-muted-foreground">
                {documents.filter((doc) => doc.category === category.type || doc.type === category.type).length} uploaded
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Uploaded Documents">
        <DataTable
          columns={columns}
          data={documents}
          variant="striped"
          isLoading={isLoading}
          emptyTitle="No documents uploaded yet."
        />
      </SectionCard>

      <ProjectDocumentDialog
        open={dialogOpen}
        draft={draft}
        setDraft={setDraft}
        onOpenChange={setDialogOpen}
        onSave={saveDocument}
        projectId={projectId}
      />
    </div>
  );
}
