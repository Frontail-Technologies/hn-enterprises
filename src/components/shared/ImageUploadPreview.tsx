"use client";

import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { ImageSquareIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ImagePreviewItem = {
  id: string;
  label: string;
  fileName: string;
  previewUrl?: string;
  uploadedOn?: string;
};

interface ImageUploadPreviewProps {
  images: ImagePreviewItem[];
  onChange?: (images: ImagePreviewItem[]) => void;
  className?: string;
}

export function ImageUploadPreview({
  images,
  onChange,
  className,
}: ImageUploadPreviewProps) {
  const [items, setItems] = useState<ImagePreviewItem[]>(images);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function update(nextItems: ImagePreviewItem[]) {
    setItems(nextItems);
    onChange?.(nextItems);
  }

  function addFiles(files: FileList | null) {
    const nextFiles = Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));
    if (!nextFiles.length) return;
    update([
      ...items,
      ...nextFiles.map((file, index) => ({
        id: `img-${Date.now()}-${index}`,
        label: file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
        uploadedOn: new Date().toISOString(),
      })),
    ]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5 text-center transition-colors",
          isDragging && "border-primary bg-primary/5",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => addFiles(event.target.files)}
        />
        <UploadSimpleIcon size={22} className="text-primary" />
        <p className="mt-2 text-sm font-semibold text-foreground">Upload images</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Drag and drop images here, or choose files.
        </p>
        <Button type="button" variant="outline" size="sm" className="mt-3">
          Choose Images
        </Button>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="min-w-0 rounded-lg border border-border/70 bg-card p-2.5">
            <div className="flex h-28 items-center justify-center overflow-hidden rounded-md bg-muted/30">
              {item.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.previewUrl} alt={item.label} className="h-full w-full object-cover" />
              ) : (
                <ImageSquareIcon size={30} className="text-primary" />
              )}
            </div>
            <div className="mt-2 space-y-2">
              <Input
                value={item.label}
                onChange={(event) =>
                  update(items.map((image) => image.id === item.id ? { ...image, label: event.target.value } : image))
                }
                className="h-8"
                aria-label="Image label"
              />
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-xs font-medium text-muted-foreground">
                  {item.fileName}
                </p>
                <button
                  type="button"
                  aria-label="Remove image"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => update(items.filter((image) => image.id !== item.id))}
                >
                  <TrashIcon size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
