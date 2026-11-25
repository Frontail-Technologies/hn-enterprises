"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowClockwiseIcon, ImageSquareIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { filesFromDrop } from "@/lib/file-drop";
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
        const result = await uploadFile(item.file!, module, recordId, item.fileName);
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

export function appendSingleImage(formData: FormData, fieldKey: string, item: ImagePreviewItem | undefined) {
  if (item?.file) {
    formData.append(fieldKey, item.file, item.fileName);
  }
}

/**
 * Camera, chat-app and download file names ("IMG_20241102_1234", "WhatsApp Image…",
 * "795880ee23362c0d…") make poor captions; those get "Photo N" instead.
 */
function isMachineName(name: string) {
  const plain = name.trim();
  return (
    !plain ||
    /^[0-9a-f-]{12,}$/i.test(plain) ||
    /^[\d\s_.-]{6,}$/.test(plain) ||
    /^(img|image|photo|pxl|dsc|screenshot|scan|whatsapp image|signal|telegram)[\s_-]/i.test(plain) ||
    /^(?=.*\d)[a-z0-9_-]{24,}$/i.test(plain)
  );
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
  const [previewItem, setPreviewItem] = useState<ImagePreviewItem | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingAdd, setIsDraggingAdd] = useState(false);
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
      const uploaded = await uploadFile(item.file, module, recordId, item.fileName);
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

  function addFiles(files: File[]) {
    const nextFiles = files.filter((file) => file.type.startsWith("image/"));
    if (!nextFiles.length) return;

    const stamp = Date.now();
    const existing = itemsRef.current.length;
    const staged = nextFiles.map((file, index) => {
      const extMatch = /\.[^.]+$/.exec(file.name);
      const ext = extMatch ? extMatch[0] : "";
      const preview: ImagePreviewItem = {
        id: `img-${stamp}-${index}`,
        label: isMachineName(file.name.replace(/\.[^.]+$/, "")) ? `Photo ${existing + index + 1}` : file.name.replace(/\.[^.]+$/, ""),
        // Semantic, non-identifying name sent to the server - mirrors the mobile
        // app's upload naming (evidence-<timestamp>-<index>.ext) instead of the
        // raw OS filename. The user-facing `label` keeps the friendly default.
        fileName: `${module}-${stamp}-${index}${ext}`,
        previewUrl: URL.createObjectURL(file),
        uploadedOn: new Date().toISOString(),
        status: "staged",
        file,
      };
      return preview;
    });

    update([...itemsRef.current, ...staged]);
  }


  return (
    <div className={cn("space-y-3", className)}>
      {/* The big drop area only while empty; after that a small "+" tile sits after the photos. */}
      {items.length ? null : (
        <FileDropzone
          accept="image/*"
          multiple
          label="Choose images"
          hint="PNG, JPG or WEBP · you can add several at once"
          onFiles={addFiles}
        />
      )}
      <input
        ref={addInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label="Add more images"
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {items.length ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-2">
          {items.map((item) => {
            const thumbSrc = item.previewUrl || resolveFileUrl(item.fileUrl);
            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border bg-card p-2",
                  item.status === "error" ? "border-destructive/40 bg-danger-soft/40" : "border-border",
                )}
              >
                <button
                  type="button"
                  disabled={!thumbSrc}
                  onClick={() => setPreviewItem(item)}
                  aria-label={`Preview ${item.label || item.fileName}`}
                  className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50 enabled:cursor-zoom-in"
                >
                  {thumbSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbSrc} alt="" className="size-full object-cover" />
                  ) : (
                    <ImageSquareIcon size={22} className="text-muted-foreground" />
                  )}
                </button>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="group/caption relative">
                  <Input
                    value={item.label}
                    onChange={(event) =>
                      update(items.map((image) => (image.id === item.id ? { ...image, label: event.target.value } : image)))
                    }
                    placeholder="Add a caption"
                    title="Caption saved with this image — click to edit"
                    className="h-7 border-transparent pr-6 pl-1.5 text-[13px] font-medium shadow-none hover:border-border focus-visible:border-ring md:text-[13px]"
                    aria-label="Image caption"
                  />
                  <PencilSimpleIcon
                    size={12}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground opacity-60 group-focus-within/caption:opacity-0 group-hover/caption:opacity-100"
                  />
                  </div>
                  <span
                    className={cn(
                      "px-1.5 text-xs",
                      item.status === "error" ? "text-destructive" : item.status === "uploaded" || !item.status ? "text-muted-foreground" : "text-primary",
                    )}
                  >
                    {item.status === "staged"
                      ? "Ready to save"
                      : item.status === "uploading"
                        ? "Uploading..."
                        : item.status === "error"
                          ? "Upload failed"
                          : "Uploaded"}
                  </span>
                </div>
                <div className="flex shrink-0 items-center">
                  {item.status === "error" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Retry upload"
                      title="Retry upload"
                      className="text-primary"
                      onClick={() => {
                        update(items.map((image) => (image.id === item.id ? { ...image, status: "uploading" } : image)));
                        void runUpload(item);
                      }}
                    >
                      <ArrowClockwiseIcon size={15} />
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove image"
                    title="Remove image"
                    className="text-muted-foreground hover:bg-danger-soft hover:text-destructive"
                    onClick={() => update(items.filter((image) => image.id !== item.id))}
                  >
                    <TrashIcon size={15} />
                  </Button>
                </div>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => addInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingAdd(true);
              }}
              onDragLeave={() => setIsDraggingAdd(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDraggingAdd(false);
                const files = filesFromDrop(event.dataTransfer);
                if (files.length) addFiles(files);
              }}
              aria-label="Add more images"
              title="Add more images"
              className={cn(
                "flex h-full min-h-16 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed text-[13px] font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                isDraggingAdd
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-muted-foreground hover:border-primary/60 hover:bg-primary-soft/40 hover:text-primary",
              )}
            >
              <PlusIcon size={16} />
              Add more
            </button>
          </li>
        </ul>
      ) : null}

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
