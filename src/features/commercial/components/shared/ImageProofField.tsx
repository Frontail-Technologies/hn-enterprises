import { cn } from "@/lib/utils";
import {
  ImageUploadPreview,
  type ImagePreviewItem,
} from "@/components/shared/ImageUploadPreview";

export function ImageProofField({
  label,
  description,
  images = [],
  onChange,
  module,
  recordId,
  className,
}: {
  label: string;
  description: string;
  images?: ImagePreviewItem[];
  onChange?: (images: ImagePreviewItem[]) => void;
  module: string;
  recordId?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ImageUploadPreview images={images} onChange={onChange} module={module} recordId={recordId} />
    </div>
  );
}
