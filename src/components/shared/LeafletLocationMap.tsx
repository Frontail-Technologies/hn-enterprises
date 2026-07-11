"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

interface LeafletLocationMapProps {
  latitude: number;
  longitude: number;
  draggable?: boolean;
  heightClassName?: string;
  onChange?: (coordinates: { latitude: number; longitude: number }) => void;
}

const markerIcon = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:var(--primary);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.25)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function LeafletLocationMap({
  latitude,
  longitude,
  draggable = false,
  heightClassName = "h-52",
  onChange,
}: LeafletLocationMapProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className={`overflow-hidden rounded-lg border border-border ${heightClassName}`}>
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {draggable ? <MapClickHandler onChange={onChange} /> : null}
        <Marker
          position={position}
          icon={markerIcon}
          draggable={draggable}
          eventHandlers={
            draggable && onChange
              ? {
                  dragend: (event) => {
                    const marker = event.target as L.Marker;
                    const next = marker.getLatLng();
                    onChange({
                      latitude: Number(next.lat.toFixed(6)),
                      longitude: Number(next.lng.toFixed(6)),
                    });
                  },
                }
              : undefined
          }
        />
      </MapContainer>
    </div>
  );
}

function MapClickHandler({
  onChange,
}: {
  onChange?: (coordinates: { latitude: number; longitude: number }) => void;
}) {
  useMapEvents({
    click: (event) => {
      onChange?.({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}
