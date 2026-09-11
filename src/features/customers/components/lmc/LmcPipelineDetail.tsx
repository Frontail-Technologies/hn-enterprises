"use client";

import { useState } from "react";
import { ImageSquareIcon } from "@phosphor-icons/react";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { KeyValueGrid } from "@/components/shared/KeyValueGrid";
import { lmcPipelineFields } from "../../config/lmc-fields";
import { deriveLmcOverallStatus, pickCivilFields } from "../../model/lmc-pipeline.rules";
import { evidenceFilesToPersistedImages, persistedImagesToEvidenceFiles } from "../../mappers/evidence.mapper";
import { useUpsertLmcPipeRecord } from "../../queries/useCustomerMutations";
import { itemsFromFields } from "../../utils/field-display";
import { formatDate } from "../../utils/format";
import { LmcPipeEditorDialog } from "./LmcPipeEditorDialog";
import { LmcPipeTable } from "./LmcPipeTable";
import type {
  LmcEvidenceFile,
  LmcPipeSizeRecord,
  LmcPipelineWork,
} from "../../types/customer.types";

export function LmcPipelineDetail({
  customerId,
  values: initialValues,
  initialPipeId,
}: {
  customerId: string;
  values: LmcPipelineWork;
  initialPipeId?: string | null;
}) {
  const [values, setValues] = useState(initialValues);
  const [editingPipeId, setEditingPipeId] = useState<string | null>(initialPipeId ?? null);
  const upsertPipeRecord = useUpsertLmcPipeRecord(customerId);
  const editingPipe = values.pipeRecords.find((record) => record.id === editingPipeId) ?? null;
  const overallStatus = deriveLmcOverallStatus(values.pipeRecords);

  const updatePipeRecord = (nextRecord: LmcPipeSizeRecord) => {
    setValues((current) => ({
      ...current,
      pipeRecords: current.pipeRecords.map((record) =>
        record.id === nextRecord.id ? nextRecord : record,
      ),
    }));
  };

  const closeDialog = () => {
    if (editingPipe) {
      upsertPipeRecord.mutate(editingPipe);
    }
    setEditingPipeId(null);
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Pipe Size Records"
        action={<StatusBadge status={overallStatus} />}
      >
        <LmcPipeTable
          records={values.pipeRecords}
          onEditRecord={setEditingPipeId}
          renderDate={formatDate}
          renderEvidence={(files) => <EvidencePreview files={files} />}
        />
      </SectionCard>

      <LmcPipeEditorDialog
        record={editingPipe}
        onFieldsChange={(next) => editingPipe && updatePipeRecord({ ...editingPipe, ...next })}
        evidenceImages={editingPipe ? evidenceFilesToPersistedImages(editingPipe.evidence) : []}
        onEvidenceChange={(images) =>
          editingPipe && updatePipeRecord({ ...editingPipe, evidence: persistedImagesToEvidenceFiles(images) })
        }
        onClose={closeDialog}
        customerId={customerId}
        description="Update this pipe sub-record inside the same customer LMC record."
        isSaving={upsertPipeRecord.isPending}
      />

      <SectionCard title="Civil / Surface Work">
        <KeyValueGrid items={itemsFromFields(lmcPipelineFields, pickCivilFields(values))} columns={3} />
      </SectionCard>
    </div>
  );
}

function EvidencePreview({ files }: { files: LmcEvidenceFile[] }) {
  if (!files.length) return <span>-</span>;

  return (
    <div className="flex max-w-56 flex-wrap gap-1.5">
      {files.map((file) => (
        <span
          key={file.id}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/25 px-1.5 py-1 text-xs text-foreground"
          title={file.fileName}
        >
          {file.fileUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.fileUrl} alt={file.fileName} className="h-4 w-4 rounded-xs object-cover" />
          ) : (
            <ImageSquareIcon size={14} className="text-primary" />
          )}
          <span className="max-w-24 truncate">{file.fileName}</span>
        </span>
      ))}
    </div>
  );
}
