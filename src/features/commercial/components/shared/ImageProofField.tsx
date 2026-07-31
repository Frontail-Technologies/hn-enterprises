import {
  ImageUploadPreview,
  type ImagePreviewItem,
} from "@/components/shared/ImageUploadPreview";

export function ImageProofField({
  label,
  description,
  images = [],
  module,
  recordId,
}: {
  label: string;
  description: string;
  images?: ImagePreviewItem[];
  module: string;
  recordId?: string;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ImageUploadPreview images={images} module={module} recordId={recordId} />
    </div>
  );
}
