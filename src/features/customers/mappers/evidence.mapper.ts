import type { ImagePreviewItem } from "@/components/shared/ImageUploadPreview";
import type { CustomerSurveyPhoto, LmcEvidenceFile } from "../types/customer.types";

/**
 * Pure evidence/photo <-> ImagePreviewItem conversions.
 *
 * Form and Detail genuinely need different output shapes here: the form
 * stages new evidence (including raw `File` blobs) for the atomic
 * customer+pipe-records save, while the detail page persists each pipe
 * record immediately through its own upsert mutation and never needs to
 * carry an in-flight `File` blob through this shape. Rather than forcing
 * one contract on both, this module exposes a shared base plus two thin
 * owner-specific adapters (§14 of the Checkpoint B brief).
 */
function baseFileToImage(file: LmcEvidenceFile): Omit<ImagePreviewItem, "status" | "file"> {
  return {
    id: file.id,
    label: file.label,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    previewUrl: file.previewUrl,
  };
}

/** Form-owned: keeps the staged `File` blob and any existing upload status. */
export function evidenceFilesToFormImages(files: LmcEvidenceFile[]): ImagePreviewItem[] {
  return files.map((file) => ({
    ...baseFileToImage(file),
    status: file.status ?? (file.fileUrl ? "uploaded" : undefined),
    file: file.file,
  }));
}

export function formImagesToEvidenceFiles(images: ImagePreviewItem[]): LmcEvidenceFile[] {
  return images.map((image) => ({
    id: image.id,
    label: image.label,
    fileName: image.fileName,
    fileUrl: image.fileUrl,
    previewUrl: image.previewUrl,
    status: image.status,
    file: image.file,
  }));
}

/** Detail-owned: records persist immediately via the per-record upsert mutation. */
export function evidenceFilesToPersistedImages(files: LmcEvidenceFile[]): ImagePreviewItem[] {
  return files.map((file) => ({
    ...baseFileToImage(file),
    status: file.fileUrl ? "uploaded" : undefined,
  }));
}

export function persistedImagesToEvidenceFiles(images: ImagePreviewItem[]): LmcEvidenceFile[] {
  return images.map((image) => ({
    id: image.id,
    label: image.label,
    fileName: image.fileName,
    fileUrl: image.fileUrl,
  }));
}

export function surveyPhotosToImages(photos: CustomerSurveyPhoto[]): ImagePreviewItem[] {
  return photos.map((photo) => ({
    id: photo.id,
    label: photo.label,
    fileName: photo.fileName,
    fileUrl: photo.fileUrl,
    previewUrl: photo.previewUrl,
    status: photo.status ?? (photo.fileUrl ? "uploaded" : undefined),
    file: photo.file,
  }));
}

export function imagesToSurveyPhotos(images: ImagePreviewItem[]): CustomerSurveyPhoto[] {
  return images.map((image) => ({
    id: image.id,
    label: image.label,
    caption: image.label,
    fileName: image.fileName,
    fileUrl: image.fileUrl,
    previewUrl: image.previewUrl,
    status: image.status,
    file: image.file,
  }));
}
