"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useCurrentLocation } from "@/lib/hooks/useCurrentLocation";

const LeafletLocationMap = dynamic(
  () =>
    import("@/components/shared/LeafletLocationMap").then(
      (module) => module.LeafletLocationMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-52 items-center justify-center rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground">
        Loading map...
      </div>
    ),
  },
);

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  heightClassName?: string;
  onChange: (coordinates: { latitude: number; longitude: number }) => void;
}

export function LocationPicker({
  latitude,
  longitude,
  heightClassName = "h-52",
  onChange,
}: LocationPickerProps) {
  const { coordinates, isLoading, error, requestLocation } = useCurrentLocation();
  const appliedCoordinatesKey = useRef<string | null>(null);

  const useCurrent = () => {
    requestLocation();
  };

  useEffect(() => {
    if (!coordinates) return;
    const key = `${coordinates.latitude},${coordinates.longitude}`;
    if (appliedCoordinatesKey.current === key) return;
    appliedCoordinatesKey.current = key;
    onChange(coordinates);
  }, [coordinates, onChange]);

  return (
    <div className="space-y-2">
      <LeafletLocationMap
        latitude={latitude}
        longitude={longitude}
        draggable
        heightClassName={heightClassName}
        onChange={onChange}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          Click the map or drag the marker.
        </p>
        <Button type="button" size="sm" variant="outline" onClick={useCurrent}>
          {isLoading ? "Locating..." : "Use Current Location"}
        </Button>
      </div>
      {error ? <p className="text-xs text-muted-foreground">{error}</p> : null}
    </div>
  );
}
