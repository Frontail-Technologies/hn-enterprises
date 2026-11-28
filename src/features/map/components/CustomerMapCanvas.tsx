"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, ScaleControl, TileLayer, useMap } from "react-leaflet";
import { STAGE_STYLE, type CustomerMapPoint } from "../customer-map.types";
import { stagePin } from "./map-pins";

export type BaseLayer = "street" | "satellite";

const INDIA_CENTER: [number, number] = [22.5, 80];

const TILES: Record<BaseLayer, { url: string; attribution: string; maxZoom: number }> = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery &copy; Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
  },
};

/** Fits the view to the pins whenever `fitKey` changes (filters, "Fit all" button). */
function FitToPoints({ points, fitKey }: { points: CustomerMapPoint[]; fitKey: string }) {
  const map = useMap();
  // Latest pins, read when a fit is asked for (fitting on every pin change would fight the user's zoom).
  const pointsRef = useRef(points);
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);
  useEffect(() => {
    const current = pointsRef.current;
    if (!current.length) {
      map.setView(INDIA_CENTER, 5);
      return;
    }
    map.fitBounds(L.latLngBounds(current.map((point) => [point.lat, point.lng] as [number, number])), {
      padding: [40, 40],
      maxZoom: 17,
    });
  }, [map, fitKey]);
  return null;
}

/** Flies to the chosen customer and opens its popup. */
function FlyToSelected({
  point,
  markers,
}: {
  point: CustomerMapPoint | undefined;
  markers: React.RefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!point) return;
    map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 17), { duration: 0.6 });
    const timer = setTimeout(() => markers.current?.get(point.id)?.openPopup(), 650);
    return () => clearTimeout(timer);
  }, [map, point, markers]);
  return null;
}

/** Keeps Leaflet's size right when the container changes (full screen, panel toggle). */
function InvalidateOnResize({ watch }: { watch: unknown }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 120);
    return () => clearTimeout(timer);
  }, [map, watch]);
  return null;
}

export function CustomerMapCanvas({
  points,
  baseLayer,
  fitKey,
  selected,
  onSelect,
  resizeKey,
}: {
  points: CustomerMapPoint[];
  baseLayer: BaseLayer;
  /** Changes whenever the view should re-fit (filters, new data, "Fit all"). */
  fitKey: string;
  selected?: CustomerMapPoint;
  onSelect: (id: string) => void;
  resizeKey: unknown;
}) {
  const markers = useRef(new Map<string, L.Marker>());
  const tiles = TILES[baseLayer];

  return (
    <MapContainer center={INDIA_CENTER} zoom={5} scrollWheelZoom zoomControl={false} className="h-full w-full">
      <TileLayer key={baseLayer} url={tiles.url} attribution={tiles.attribution} maxZoom={tiles.maxZoom} />
      <ScaleControl position="bottomleft" imperial={false} />
      <ZoomButtons />
      <FitToPoints points={points} fitKey={fitKey} />
      <FlyToSelected point={selected} markers={markers} />
      <InvalidateOnResize watch={resizeKey} />
      <NameLabelsWhenZoomed />
      {points.map((point) => {
        const style = STAGE_STYLE[point.stage];
        return (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={stagePin(point.stage, point.name || point.bpNo)}
            title={point.name || point.bpNo}
            ref={(marker) => {
              if (marker) markers.current.set(point.id, marker);
              else markers.current.delete(point.id);
            }}
            eventHandlers={{ click: () => onSelect(point.id) }}
          >
            <Popup>
              <div className="min-w-44 space-y-0.5 text-[13px]">
                <p className="font-semibold">{point.name || "Unnamed customer"}</p>
                <p className="text-muted-foreground">BP: {point.bpNo || "-"}</p>
                {point.projectName ? <p className="text-muted-foreground">{point.projectName}</p> : null}
                <p style={{ color: style.color }} className="font-medium">
                  {style.label}
                </p>
                <div className="flex gap-3 pt-1">
                  <Link href={`/customers/${point.id}`} className="font-medium text-primary hover:underline">
                    Open customer
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${point.lat},${point.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

/** Customer names next to the pins only from street level (zoom 15+), so a wide view stays readable. */
function NameLabelsWhenZoomed() {
  const map = useMap();
  useEffect(() => {
    const update = () => map.getContainer().classList.toggle("hn-show-labels", map.getZoom() >= 15);
    update();
    map.on("zoomend", update);
    return () => {
      map.off("zoomend", update);
    };
  }, [map]);
  return null;
}

/** + / − in the top right (Leaflet's own control, placed out of the panel's way). */
function ZoomButtons() {
  const map = useMap();
  useEffect(() => {
    const control = L.control.zoom({ position: "topright" });
    control.addTo(map);
    return () => {
      control.remove();
    };
  }, [map]);
  return null;
}
