"use client";

import { useRef, useState } from "react";
import { UploadSimpleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  /** Small line under the call to action, e.g. allowed types/size. */
  hint?: string;
  /** Shows a busy label and blocks picking while an upload runs. */
  busy?: boolean;
  invalid?: boolean;
  label?: string;
  className?: string;
}

/** Click-or-drop area for picking files; one look for every upload in the app. */
export function FileDropzone({ onFiles, accept, multiple, hint, busy, invalid, label = "Choose files", className }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        tabIndex={-1}
        aria-label={label}
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!busy) onFiles(Array.from(event.dataTransfer.files));
        }}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-wait disabled:opacity-70",
          isDragging
            ? "border-primary bg-primary-soft"
            : invalid
              ? "border-destructive/60 bg-card"
              : "border-border-strong bg-card hover:border-primary/50 hover:bg-muted/40",
          className,
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
          <UploadSimpleIcon size={20} weight="bold" />
        </span>
        <span className="text-sm">
          {busy ? (
            <span className="font-semibold text-primary">Uploading...</span>
          ) : isDragging ? (
            <span className="font-semibold text-primary">Drop to add</span>
          ) : (
            <>
              <span className="font-semibold text-primary">Click to upload</span>
              <span className="text-muted-foreground"> or drag and drop</span>
            </>
          )}
        </span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </button>
    </>
  );
}
