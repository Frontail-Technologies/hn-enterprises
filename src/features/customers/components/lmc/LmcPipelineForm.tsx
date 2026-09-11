"use client";

import { useState } from "react";
import { ImageSquareIcon } from "@phosphor-icons/react";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { deriveLmcOverallStatus } from "../../model/lmc-pipeline.rules";
import { evidenceFilesToFormImages, formImagesToEvidenceFiles } from "../../mappers/evidence.mapper";
import { LmcPipeEditorDialog } from "./LmcPipeEditorDialog";
import { LmcPipeTable } from "./LmcPipeTable";
import type { LmcEvidenceFile, LmcPipeSizeRecord, LmcPipelineWork } from "../../types/customer.types";

/**
 * Form-owned LMC pipeline section (§6 of the Checkpoint B brief). Edits
 * RHF/form-owned pipe state via `onChange` - it does not persist individual
 * records itself; the atomic customer+pipe-records save happens in
 * `CustomerForm`'s submit handler.
 */
export function LmcPipelineForm({
  values,
  onChange,
  customerId,
}: {
  values: LmcPipelineWork;
  onChange: (values: LmcPipelineWork) => void;
  customerId?: string;
}) {
  const [editingPipeId, setEditingPipeId] = useState<string | null>(null);
  const editingPipe = values.pipeRecords.find((record) => record.id === editingPipeId) ?? null;
  const overallStatus = deriveLmcOverallStatus(values.pipeRecords);

  const updatePipeRecord = (nextRecord: LmcPipeSizeRecord) => {
    onChange({
      ...values,
      pipeRecords: values.pipeRecords.map((record) =>
        record.id === nextRecord.id ? nextRecord : record,
      ),
    });
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Pipe Size Records" action={<StatusBadge status={overallStatus} />}>
        <LmcPipeTable
          records={values.pipeRecords}
          onEditRecord={setEditingPipeId}
          renderEvidence={(files) => <EvidenceSummary files={files} />}
        />
      </SectionCard>

      <LmcPipeEditorDialog
        record={editingPipe}
        onFieldsChange={(next) => editingPipe && updatePipeRecord({ ...editingPipe, ...next })}
        evidenceImages={editingPipe ? evidenceFilesToFormImages(editingPipe.evidence) : []}
        onEvidenceChange={(images) =>
          editingPipe && updatePipeRecord({ ...editingPipe, evidence: formImagesToEvidenceFiles(images) })
        }
        onClose={() => setEditingPipeId(null)}
        customerId={customerId}
      />
    </div>
  );
}

function EvidenceSummary({ files }: { files: LmcEvidenceFile[] }) {
  if (!files.length) return <span>-</span>;

  return (
    <span className="inline-flex items-center justify-end gap-1.5">
      <ImageSquareIcon size={15} className="text-primary" />
      <span>{files.length} image{files.length > 1 ? "s" : ""}</span>
    </span>
  );
}
