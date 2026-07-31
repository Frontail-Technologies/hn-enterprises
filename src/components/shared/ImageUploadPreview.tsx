"use client";

import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { ImageSquareIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { uploadFile } from "@/lib/upload";

export type ImagePreviewItem = {
  id: string;
  label: string;
  fileName: string;
  previewUrl?: string;
  fileUrl?: string;
  uploadedOn?: string;
  status?: "uploading" | "uploaded" | "error";
};

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

  function patchItem(id: string, patch: Partial<ImagePreviewItem>) {
    update(itemsRef.current.map((image) => (image.id === id ? { ...image, ...patch } : image)));
  }

  async function addFiles(files: FileList | null) {
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
        status: "uploading",
      };
      return { file, preview };
    });

    update([...itemsRef.current, ...staged.map(({ preview }) => preview)]);

    await Promise.all(
      staged.map(async ({ file, preview: { id } }) => {
        try {
          const uploaded = await uploadFile(file, module, recordId);
          patchItem(id, { fileUrl: uploaded.url, fileName: uploaded.fileName, status: "uploaded" });
        } catch {
          patchItem(id, { status: "error" });
        }
      }),
    );
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    void addFiles(event.dataTransfer.files);
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
          onChange={(event) => void addFiles(event.target.files)}
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
        {items.map((item) => (
          <Attachment
            key={item.id}
            orientation="horizontal"
            className="w-full rounded-sm border-border/70"
          >
            <AttachmentMedia
              variant={item.previewUrl ? "image" : "icon"}
              className="h-14 w-14 rounded-sm"
            >
              {item.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.previewUrl} alt={item.label} className="h-full w-full object-cover" />
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
                {item.status === "uploading" ? (
                  <span className="ml-1.5 text-primary">Uploading...</span>
                ) : null}
                {item.status === "error" ? (
                  <span className="ml-1.5 text-destructive">Upload failed</span>
                ) : null}
              </AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions className="ml-auto">
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
        ))}
      </AttachmentGroup>
    </div>
  );
}
