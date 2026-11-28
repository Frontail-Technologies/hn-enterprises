"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowsInIcon,
  ArrowsOutIcon,
  CornersOutIcon,
  GlobeHemisphereEastIcon,
  MagnifyingGlassIcon,
  MapTrifoldIcon,
  SidebarSimpleIcon,
} from "@phosphor-icons/react";
import { PageShell } from "@/components/shared/PageShell";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { projectOption } from "@/features/projects/utils/project-option";
import { apiRequest } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { STAGE_STYLE, type CustomerMapPoint, type MapStage } from "../customer-map.types";
import type { BaseLayer } from "./CustomerMapCanvas";
import { stagePinMarkup } from "./map-pins";

// Leaflet touches `window`: load the map in the browser only.
const CustomerMapCanvas = dynamic(() => import("./CustomerMapCanvas").then((module) => module.CustomerMapCanvas), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

const STAGES: MapStage[] = ["none", "survey", "gi", "commissioning", "conversion"];
const LIST_LIMIT = 200;

/**
 * Customers on a map: only those with a saved location (survey GPS). Filter by
 * project, stage and search; zoom, satellite view, full screen, and a list
 * that jumps to the customer on the map.
 */
export function CustomerMapPage() {
  const { data: projects = [] } = useProjectsQuery();
  const [projectId, setProjectId] = useState("");
  const [stages, setStages] = useState<MapStage[]>(STAGES);
  const [search, setSearch] = useState("");
  const [baseLayer, setBaseLayer] = useState<BaseLayer>("street");
  const [selectedId, setSelectedId] = useState<string>();
  const [manualFit, setManualFit] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  const { data: points = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["map", "customers", projectId || "all"],
    queryFn: () =>
      apiRequest<CustomerMapPoint[]>(`/dashboard/customer-map${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`),
  });

  const counts = useMemo(() => {
    const result: Partial<Record<MapStage, number>> = {};
    points.forEach((point) => {
      result[point.stage] = (result[point.stage] ?? 0) + 1;
    });
    return result;
  }, [points]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return points.filter(
      (point) =>
        stages.includes(point.stage) &&
        (!query || point.name.toLowerCase().includes(query) || point.bpNo.toLowerCase().includes(query)),
    );
  }, [points, stages, search]);

  const selected = visible.find((point) => point.id === selectedId);

  // The view re-fits when the project, stages or loaded pins change, or on "Fit all"
  // (not on search, so typing doesn't keep moving the map).
  const fitKey = `${manualFit}|${projectId}|${stages.join(",")}|${points.length}`;
  const refit = () => setManualFit((key) => key + 1);
  const toggleStage = (stage: MapStage) => {
    setStages((current) => (current.includes(stage) ? current.filter((item) => item !== stage) : [...current, stage]));
  };

  const mapArea = (
    <div
      className={cn(
        "relative flex min-h-[520px] overflow-hidden rounded-card border border-border bg-card shadow-card",
        fullScreen ? "fixed inset-3 z-50 min-h-0" : "md:min-h-0 md:flex-1",
      )}
    >
      {panelOpen ? (
        <aside className="flex w-72 shrink-0 flex-col border-r border-border max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:z-[600] max-md:bg-card max-md:shadow-lg">
          <div className="space-y-3 border-b border-border p-3">
            <div className="relative">
              <MagnifyingGlassIcon size={15} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer or BP no." className="h-8 pl-8 text-[13px]" />
            </div>
            <SearchableSelect
              value={projectId || "all"}
              onValueChange={(value) => {
                setProjectId(!value || value === "all" ? "" : value);
                setSelectedId(undefined);
              }}
              options={[{ value: "all", label: "All projects" }, ...projects.map(projectOption)]}
              placeholder="All projects"
              searchPlaceholder="Search projects..."
              className="h-8 w-full text-[13px]"
            />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Stage</span>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => {
                    setStages(stages.length === STAGES.length ? [] : STAGES);
                  }}
                >
                  {stages.length === STAGES.length ? "Clear" : "All"}
                </button>
              </div>
              {STAGES.map((stage) => (
                <label key={stage} className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-[13px] hover:bg-muted/60">
                  <Checkbox checked={stages.includes(stage)} onCheckedChange={() => toggleStage(stage)} />
                  {/* Same 3D pin as on the map. Fixed markup from our own constants. */}
                  <span className="inline-flex h-4 w-3 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: stagePinMarkup(stage) }} />
                  <span className="flex-1">{STAGE_STYLE[stage].label}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{counts[stage] ?? 0}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
            <span>
              {isLoading ? "Loading..." : `${visible.length.toLocaleString("en-IN")} of ${points.length.toLocaleString("en-IN")} on map`}
            </span>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-2">
            {visible.slice(0, LIST_LIMIT).map((point) => (
              <li key={point.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(point.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted/60",
                    point.id === selectedId && "bg-primary/8",
                  )}
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: STAGE_STYLE[point.stage].color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-foreground">{point.name || "Unnamed customer"}</span>
                    <span className="block truncate text-xs text-muted-foreground">{point.bpNo || "-"}</span>
                  </span>
                </button>
              </li>
            ))}
            {visible.length > LIST_LIMIT ? (
              <li className="px-2 py-2 text-xs text-muted-foreground">
                Showing the first {LIST_LIMIT}. Search or filter to narrow down.
              </li>
            ) : null}
          </ul>
        </aside>
      ) : null}

      <div className="relative min-w-0 flex-1">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-none" />
        ) : (
          <CustomerMapCanvas
            points={visible}
            baseLayer={baseLayer}
            fitKey={fitKey}
            selected={selected}
            onSelect={setSelectedId}
            resizeKey={`${fullScreen}-${panelOpen}`}
          />
        )}

        {/* Map tools, top left (zoom +/− is Leaflet's, top right). */}
        <div className="absolute top-3 left-3 z-[500] flex flex-col gap-1.5">
          <MapTool label={panelOpen ? "Hide panel" : "Show panel"} onClick={() => setPanelOpen((open) => !open)}>
            <SidebarSimpleIcon size={16} />
          </MapTool>
          <MapTool label="Fit all pins" onClick={refit}>
            <CornersOutIcon size={16} />
          </MapTool>
          <MapTool
            label={baseLayer === "street" ? "Satellite view" : "Street view"}
            onClick={() => setBaseLayer((layer) => (layer === "street" ? "satellite" : "street"))}
          >
            {baseLayer === "street" ? <GlobeHemisphereEastIcon size={16} /> : <MapTrifoldIcon size={16} />}
          </MapTool>
          <MapTool label={fullScreen ? "Exit full screen" : "Full screen"} onClick={() => setFullScreen((value) => !value)}>
            {fullScreen ? <ArrowsInIcon size={16} /> : <ArrowsOutIcon size={16} />}
          </MapTool>
        </div>

        {!isLoading && (isError || points.length === 0) ? (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-[500] flex justify-center px-16">
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
    </div>
  );

  return (
    <PageShell title="Map" description="Customers with a saved location, coloured by stage." fillHeight>
      {fullScreen ? <div className="min-h-[520px] md:flex-1" /> : null}
      {mapArea}
    </PageShell>
  );
}

function MapTool({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="outline"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="bg-card shadow-card hover:bg-muted"
    >
      {children}
    </Button>
  );
}
