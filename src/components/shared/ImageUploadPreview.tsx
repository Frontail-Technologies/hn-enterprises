"use client";

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { ArrowClockwiseIcon, ImageSquareIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { resolveFileUrl, uploadFile } from "@/lib/upload";
import { cn } from "@/lib/utils";

export type ImagePreviewItem = {
  id: string;
  label: string;
  fileName: string;
  previewUrl?: string;
  fileUrl?: string;
  uploadedOn?: string;
  status?: "staged" | "uploading" | "uploaded" | "error";
  file?: File;
};

/**
 * Uploads every not-yet-uploaded item (anything still carrying a local `file`) and
 * returns the resolved list with real `fileUrl`s. Call this from a parent form's save
 * handler - on the state itself, not a ref into the widget - since the widget may live
 * inside a tab or dialog that's no longer mounted by the time the user hits Save.
 * Throws if any file fails to upload, so the caller can stop the save.
 */
export async function flushImageUploads(
  items: ImagePreviewItem[],
  module: string,
  recordId?: string,
): Promise<ImagePreviewItem[]> {
  const pending = items.filter((item) => item.file && item.status !== "uploaded");
  if (!pending.length) return items;

  const uploaded = await Promise.all(
    pending.map(async (item) => {
      try {
        const result = await uploadFile(item.file!, module, recordId);
        return { ...item, fileUrl: result.url, status: "uploaded" as const, file: undefined };
      } catch {
        return { ...item, status: "error" as const };
      }
    }),
  );

  const next = items.map((item) => uploaded.find((u) => u.id === item.id) ?? item);
  if (uploaded.some((item) => item.status === "error")) {
    throw new Error("One or more files failed to upload");
  }

  return next;
}

/**
 * Appends an array-shaped evidence field to a save request's FormData: items
 * that are already uploaded (real fileUrl, no local file) go in as a
 * JSON-stringified array under `fieldKey`; not-yet-uploaded local files go in
 * as repeated "files" fields, to be uploaded server-side in the same request.
 * Use this instead of `flushImageUploads` when the target endpoint embeds the
 * upload in the save request itself (one round-trip instead of two).
 */
export function appendEvidenceArray(formData: FormData, fieldKey: string, items: ImagePreviewItem[]) {
  const alreadyUploaded = items.filter((item) => item.fileUrl && !item.file);
  formData.append(
    fieldKey,
    JSON.stringify(
      alreadyUploaded.map((item) => ({ id: item.id, label: item.label, fileName: item.fileName, fileUrl: item.fileUrl })),
    ),
  );
  items
    .filter((item) => item.file)
    .forEach((item) => {
      formData.append("files", item.file!, item.fileName);
    });
}

/**
 * Appends a single not-yet-uploaded image to a save request's FormData under
 * `fieldKey` (e.g. "file"), to be uploaded server-side in the same request.
 * A no-op if the item is already uploaded or absent - the caller is
 * responsible for sending the existing url/fileName as plain fields in that
 * case, since there's nothing new to embed.
 */
export function appendSingleImage(formData: FormData, fieldKey: string, item: ImagePreviewItem | undefined) {
  if (item?.file) {
    formData.append(fieldKey, item.file, item.fileName);
  }
}

interface ImageUploadPreviewProps {
  images: ImagePreviewItem[];
  onChange?: (images: ImagePreviewItem[]) => void;
  className?: string;
  module: string;
  recordId?: string;
}

export function ImageUploadPreview({
  images,
  onChange,
  className,
  module,
  recordId,
}: ImageUploadPreviewProps) {
  const [localItems, setLocalItems] = useState<ImagePreviewItem[]>(images);
  const [isDragging, setIsDragging] = useState(false);
  const [previewItem, setPreviewItem] = useState<ImagePreviewItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = Boolean(onChange);
  const items = isControlled ? images : localItems;
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  function update(nextItems: ImagePreviewItem[]) {
    itemsRef.current = nextItems;
    if (!isControlled) setLocalItems(nextItems);
    onChange?.(nextItems);
  }

  async function runUpload(item: ImagePreviewItem) {
    if (!item.file) return;
    try {
      const uploaded = await uploadFile(item.file, module, recordId);
      update(
        itemsRef.current.map((current) =>
          current.id === item.id
            ? { ...current, fileUrl: uploaded.url, status: "uploaded", file: undefined }
            : current,
        ),
      );
    } catch {
      update(
        itemsRef.current.map((current) => (current.id === item.id ? { ...current, status: "error" } : current)),
      );
    }
  }

  function addFiles(files: FileList | null) {
    const nextFiles = Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));
    if (inputRef.current) inputRef.current.value = "";
    if (!nextFiles.length) return;

    const staged = nextFiles.map((file, index) => {
      const preview: ImagePreviewItem = {
        id: `img-${Date.now()}-${index}`,
        label: file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
        uploadedOn: new Date().toISOString(),
        status: "staged",
        file,
      };
      return preview;
    });

    update([...itemsRef.current, ...staged]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Attachment
        state="idle"
        orientation="horizontal"
        className={cn(
          "w-full cursor-pointer items-center gap-3 rounded-sm border-dashed bg-muted/20 p-4",
          isDragging && "border-primary bg-primary/5",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => addFiles(event.target.files)}
        />
        <AttachmentTrigger onClick={() => inputRef.current?.click()} />
        <AttachmentMedia className="bg-primary/10 text-primary">
          <UploadSimpleIcon size={22} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Upload images</AttachmentTitle>
          <AttachmentDescription>
            Drag and drop images here, or choose files.
          </AttachmentDescription>
        </AttachmentContent>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="relative z-20 shrink-0"
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Choose Images
        </Button>
      </Attachment>

      <AttachmentGroup className="flex flex-col gap-2 overflow-visible py-0">
        {items.map((item) => {
          const thumbSrc = item.previewUrl || resolveFileUrl(item.fileUrl);
          return (
            <Attachment
              key={item.id}
              orientation="horizontal"
              state={item.status === "uploading" ? "uploading" : item.status === "error" ? "error" : "done"}
              className="w-full rounded-sm border-border/70"
            >
              <AttachmentMedia
                variant={thumbSrc ? "image" : "icon"}
                className={cn("h-14 w-14 rounded-sm", thumbSrc && "cursor-pointer")}
                onClick={thumbSrc ? () => setPreviewItem(item) : undefined}
              >
                {thumbSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbSrc} alt={item.label} className="h-full w-full object-cover" />
                ) : (
                  <ImageSquareIcon size={30} className="text-primary" />
                )}
              </AttachmentMedia>
              <AttachmentContent className="min-w-0 space-y-1">
                <Input
                  value={item.label}
                  onChange={(event) =>
                    update(items.map((image) => image.id === item.id ? { ...image, label: event.target.value } : image))
                  }
                  className="h-8 max-w-sm"
                  aria-label="Image label"
                />
                <AttachmentDescription className="mt-0">
                  {item.fileName}
                  {item.status === "staged" ? (
                    <span className="ml-1.5 text-primary">Ready to save</span>
                  ) : null}
                  {item.status === "uploading" ? (
                    <span className="ml-1.5 text-primary">Uploading...</span>
                  ) : null}
                  {item.status === "error" ? (
                    <span className="ml-1.5 text-destructive">Upload failed</span>
                  ) : null}
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions className="ml-auto">
                {item.status === "error" ? (
                  <AttachmentAction
                    type="button"
                    aria-label="Retry upload"
                    className="text-primary hover:text-primary"
                    onClick={() => {
                      update(items.map((image) => (image.id === item.id ? { ...image, status: "uploading" } : image)));
                      void runUpload(item);
                    }}
                  >
                    <ArrowClockwiseIcon size={15} />
                  </AttachmentAction>
                ) : null}
                <AttachmentAction
                  type="button"
                  aria-label="Remove image"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => update(items.filter((image) => image.id !== item.id))}
                >
                  <TrashIcon size={15} />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          );
        })}
      </AttachmentGroup>

      <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogTitle className="truncate">{previewItem?.label || previewItem?.fileName}</DialogTitle>
          {previewItem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewItem.previewUrl || resolveFileUrl(previewItem.fileUrl)}
              alt={previewItem.label}
              className="max-h-[70vh] w-full rounded-md object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
