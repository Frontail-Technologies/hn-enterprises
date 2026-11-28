"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { MapPinIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api-client";
import { STAGE_STYLE, type CustomerMapPoint, type MapStage } from "./customer-map.types";
import { stagePinMarkup } from "./map-pins";

// Leaflet touches `window`: load it in the browser only.
const CustomerLeafletMap = dynamic(() => import("./CustomerLeafletMap").then((module) => module.CustomerLeafletMap), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

const LEGEND_ORDER: MapStage[] = ["none", "survey", "gi", "commissioning", "conversion"];

/**
 * Dashboard map: every customer that has a location (from the survey's GPS),
 * coloured by how far their work has got. Customers without a location are
 * simply not on the map; with none at all the map still shows, empty.
 */
export function DashboardCustomerMap({ projectId }: { projectId?: string }) {
  const { data: points = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", "customer-map", projectId ?? "all"],
    queryFn: () => {
      const query = projectId && projectId !== "all" ? `?projectId=${encodeURIComponent(projectId)}` : "";
      return apiRequest<CustomerMapPoint[]>(`/dashboard/customer-map${query}`);
    },
  });

  const counts = points.reduce<Partial<Record<MapStage, number>>>((acc, point) => {
    acc[point.stage] = (acc[point.stage] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="overflow-hidden rounded-card border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPinIcon size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Customers on map</h2>
          <span className="text-xs text-muted-foreground">
            {isLoading ? "" : `${points.length.toLocaleString("en-IN")} with a location`}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {LEGEND_ORDER.map((stage) => (
            <span key={stage} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              {/* Same 3D pin as on the map, scaled down. Fixed markup from our own constants. */}
              <span className="inline-flex h-4 w-3 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: stagePinMarkup(stage) }} />
              {STAGE_STYLE[stage].label}
              {counts[stage] ? <span className="tabular-nums text-foreground">{counts[stage]}</span> : null}
            </span>
          ))}
        </div>
      </div>
      <div className="relative h-[420px]">
        {isLoading ? <Skeleton className="h-full w-full rounded-none" /> : <CustomerLeafletMap points={points} />}
        {!isLoading && (isError || points.length === 0) ? (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-[500] flex justify-center px-4">
            <div className="pointer-events-auto rounded-lg border border-border bg-card/95 px-3 py-2 text-center text-[13px] text-muted-foreground shadow-card">
              {isError ? (
                <>
                  Couldn&apos;t load locations.{" "}
                  <button type="button" className="font-medium text-primary hover:underline" onClick={() => void refetch()}>
                    Retry
                  </button>
                </>
              ) : (
                "No customer has a location yet. Pins appear once a survey saves GPS (Capture GPS in the app)."
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
