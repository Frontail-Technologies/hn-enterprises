"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/shared/FormField";
import {
  ImageUploadPreview,
  type ImagePreviewItem,
} from "@/components/shared/ImageUploadPreview";
import { lmcPipeRecordFields } from "../../config/lmc-fields";
import { pickPipeEditableFields } from "../../model/lmc-pipeline.rules";
import { SectionFields } from "../shared-fields/SectionFields";
import type { FieldDefinition } from "../../config/customer-fields";
import type { LmcPipeEditableFields } from "../../model/lmc-pipeline.types";
import type { LmcPipeSizeRecord } from "../../types/customer.types";

const pipeInputFields = lmcPipeRecordFields.filter(
  (field) => field.key !== "evidence",
) as FieldDefinition<Omit<LmcPipeEditableFields, "evidence">>[];

/**
 * Common LMC pipe-record edit UI (§6/§7 of the Checkpoint B brief). Used by
 * both `LmcPipelineForm` and `LmcPipelineDetail` - it owns no persistence,
 * only the field presentation; the caller supplies the evidence images
 * (already converted through its own owner-specific mapper, since Form and
 * Detail need different `ImagePreviewItem` shapes - see
 * `mappers/evidence.mapper.ts`) and a `onClose` that performs whatever save
 * the owner requires.
 *
 * Converted from a side Sheet to a centered Dialog: the form fits
 * comfortably (9 fields + one image uploader) without a long side workflow,
 * so a medium/large centered modal reads better than a full-height drawer.
 */
export function LmcPipeEditorDialog({
  record,
  onFieldsChange,
  evidenceImages,
  onEvidenceChange,
  onClose,
  customerId,
  description = "Update this pipe sub-record inside the same LMC record.",
  doneLabel = "Done",
  isSaving = false,
}: {
  record: LmcPipeSizeRecord | null;
  onFieldsChange: (next: Omit<LmcPipeEditableFields, "evidence">) => void;
  evidenceImages: ImagePreviewItem[];
  onEvidenceChange: (images: ImagePreviewItem[]) => void;
  onClose: () => void;
  customerId?: string;
  description?: string;
  doneLabel?: string;
  isSaving?: boolean;
}) {
  return (
    <Dialog open={Boolean(record)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {record ? (
          <>
            <DialogHeader className="border-b border-border/70 px-5 py-4">
              <DialogTitle>Edit {record.pipeSize} Pipe</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <SectionFields
                fields={pipeInputFields}
                values={pickPipeEditableFields(record)}
                onChange={onFieldsChange}
                gridClassName="grid gap-4"
              />
              <div className="mt-4">
                <FormField label="Evidence Images">
                  <ImageUploadPreview
                    key={record.id}
                    className="min-w-0"
                    images={evidenceImages}
                    onChange={onEvidenceChange}
                    module="customers"
                    recordId={customerId}
                  />
                </FormField>
              </div>
            </div>
            <DialogFooter className="border-t border-border/70 px-5 py-4">
              <Button type="button" disabled={isSaving} onClick={onClose}>
                {isSaving ? "Saving..." : doneLabel}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
