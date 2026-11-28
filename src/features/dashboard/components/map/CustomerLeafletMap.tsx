"use client";

import { useEffect } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { STAGE_STYLE, type CustomerMapPoint } from "./customer-map.types";
import { stagePin } from "./map-pins";

const INDIA_CENTER: [number, number] = [22.5, 80];

/** Zooms to the pins whenever they change (stays on India when there are none). */
function FitToPoints({ points }: { points: CustomerMapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) {
      map.setView(INDIA_CENTER, 4);
      return;
    }
    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 });
  }, [map, points]);
  return null;
}

/** Leaflet map with a 3D pin per customer, coloured by stage. */
export function CustomerLeafletMap({ points }: { points: CustomerMapPoint[] }) {
  return (
    <MapContainer center={INDIA_CENTER} zoom={4} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToPoints points={points} />
      {points.map((point) => {
        const style = STAGE_STYLE[point.stage];
        return (
          <Marker key={point.id} position={[point.lat, point.lng]} icon={stagePin(point.stage)} title={point.name || point.bpNo}>
            <Popup>
              <div className="min-w-40 space-y-0.5 text-[13px]">
                <p className="font-semibold">{point.name || "Unnamed customer"}</p>
                <p className="text-muted-foreground">BP: {point.bpNo || "-"}</p>
                <p style={{ color: style.color }}>{style.label}</p>
                <Link href={`/customers/${point.id}`} className="font-medium text-primary hover:underline">
                  Open customer
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
