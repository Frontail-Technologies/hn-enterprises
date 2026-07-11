import dynamic from "next/dynamic";

const LeafletLocationMap = dynamic(
  () =>
    import("@/components/shared/LeafletLocationMap").then(
      (module) => module.LeafletLocationMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-44 items-center justify-center rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground">
        Loading map...
      </div>
    ),
  },
);

interface LocationPreviewProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export function LocationPreview({
  latitude,
  longitude,
  className,
}: LocationPreviewProps) {
  return (
    <div className={className}>
      <LeafletLocationMap
        latitude={latitude}
        longitude={longitude}
        heightClassName="h-44"
      />
      <p className="mt-2 text-xs font-medium text-muted-foreground">
        {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </p>
    </div>
  );
}
