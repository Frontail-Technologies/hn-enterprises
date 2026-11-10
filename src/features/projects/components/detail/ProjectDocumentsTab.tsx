"use client";

import { useState } from "react";
import { FileArrowUpIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ListTable, useClientRows, useListState } from "@/components/shared/list";
import { SectionCard } from "@/components/shared/SectionCard";
import {
  useCreateProjectDocument,
  useDeleteProjectDocument,
  useProjectDocumentsQuery,
} from "@/features/projects/hooks/useProjects";
import type { ProjectDocument } from "../../types/project.types";
import { documentCategories, emptyDocument } from "./project-document.constants";
import { ProjectDocumentRowActions, projectDocumentColumns, projectDocumentSearchText } from "./ProjectDocumentsTab.columns";
import { ProjectDocumentDialog } from "./ProjectDocumentDialog";
import { ProjectTabHeader } from "./ProjectTabHeader";

export function ProjectDocumentsTab({ projectId }: { projectId: string }) {
  const { data: documents = [], isLoading, isError, refetch } = useProjectDocumentsQuery(projectId);
  const createDocumentMutation = useCreateProjectDocument(projectId);
  const deleteDocumentMutation = useDeleteProjectDocument(projectId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<ProjectDocument>(emptyDocument);
  const list = useListState({ pageSize: 25, storageKey: "project-documents" });
  const { pageRows, total } = useClientRows(documents, list, { columns: projectDocumentColumns, searchText: projectDocumentSearchText });

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

      <section className="space-y-3">
        <h3 className="text-section-title">Uploaded Documents</h3>
        <ListTable
          itemLabel="document"
          rows={pageRows}
          total={total}
          columns={projectDocumentColumns}
          state={list}
          searchPlaceholder="Search name, number, type or file..."
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          empty={{ illustration: "documents", title: "No documents uploaded yet." }}
          rowActionsWidth={108}
          renderRowActions={(doc) => <ProjectDocumentRowActions doc={doc} onDelete={(id) => deleteDocumentMutation.mutate(id)} />}
        />
      </section>

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
