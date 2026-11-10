"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";

const MAX_PHOTO_MB = 5;

/**
 * Profile photo picker: round preview + Upload/Change + Remove. Uploads the
 * file right away (module "avatars") and reports its URL via `onChange`;
 * the surrounding form saves it. `""` means no photo.
 */
export function AvatarUploadField({
  name,
  value,
  onChange,
  recordId,
  className,
}: {
  /** Person's name, for the initials fallback. */
  name: string;
  value: string;
  onChange: (url: string) => void;
  /** Owner id stored with the upload (optional). */
  recordId?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function pick(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) return setError("Choose an image file (JPG, PNG or WEBP).");
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) return setError(`Photo must be under ${MAX_PHOTO_MB} MB.`);
    setUploading(true);
    try {
      const uploaded = await uploadFile(file, "avatars", recordId);
      onChange(uploaded.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <UserAvatar name={name} src={value} size="xl" className={uploading ? "animate-pulse" : undefined} />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="compact" disabled={uploading} onClick={() => inputRef.current?.click()}>
            {uploading ? "Uploading…" : value ? "Change photo" : "Upload photo"}
          </Button>
          {value && !uploading ? (
            <Button type="button" variant="ghost" size="compact" className="text-muted-foreground hover:text-destructive" onClick={() => onChange("")}>
              Remove
            </Button>
          ) : null}
        </div>
        <p className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
          {error || `JPG, PNG or WEBP, up to ${MAX_PHOTO_MB} MB. A clear face photo works best.`}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose profile photo"
        onChange={(event) => {
          void pick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
