import L from "leaflet";
import { STAGE_STYLE, type MapStage } from "../customer-map.types";

/** Darker / lighter shade of a #rrggbb colour (amount -1..1). */
function shade(hex: string, amount: number) {
  const value = parseInt(hex.slice(1), 16);
  const mix = (channel: number) => {
    const target = amount < 0 ? 0 : 255;
    return Math.round(channel + (target - channel) * Math.abs(amount));
  };
  const r = mix((value >> 16) & 255);
  const g = mix((value >> 8) & 255);
  const b = mix(value & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/**
 * A 3D-looking map pin: a lit sphere-like head on a tapered stem, with a
 * soft ground shadow. Colour = stage. Tip of the stem sits on the location.
 */
function pinSvg(stage: MapStage) {
  const base = STAGE_STYLE[stage].color;
  const light = shade(base, 0.45);
  const dark = shade(base, -0.35);
  const id = `pin-${stage}`;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40" aria-hidden="true">
  <defs>
    <radialGradient id="${id}-head" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="${light}"/>
      <stop offset="55%" stop-color="${base}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </radialGradient>
    <linearGradient id="${id}-stem" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0%" stop-color="${dark}"/>
      <stop offset="50%" stop-color="${base}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
    <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <ellipse cx="15" cy="37.5" rx="7" ry="2.5" fill="url(#${id}-shadow)"/>
  <path d="M15 37 C13.2 30 9.6 26.2 7.4 23 L22.6 23 C20.4 26.2 16.8 30 15 37 Z" fill="url(#${id}-stem)"/>
  <circle cx="15" cy="13" r="11.5" fill="url(#${id}-head)" stroke="${dark}" stroke-width="0.8"/>
  <circle cx="15" cy="13" r="4.2" fill="#ffffff" fill-opacity="0.92"/>
  <ellipse cx="11" cy="8.2" rx="4" ry="2.4" fill="#ffffff" fill-opacity="0.45" transform="rotate(-25 11 8.2)"/>
</svg>`;
}

const cache = new Map<MapStage, L.DivIcon>();

/** Leaflet icon for a stage (built once per stage). */
export function stagePin(stage: MapStage) {
  let icon = cache.get(stage);
  if (!icon) {
    icon = L.divIcon({
      className: "hn-map-pin",
      html: pinSvg(stage),
      iconSize: [30, 40],
      iconAnchor: [15, 37],
      popupAnchor: [0, -34],
    });
    cache.set(stage, icon);
  }
  return icon;
}

/** Small SVG of the same pin for the legend. */
export function stagePinMarkup(stage: MapStage) {
  return pinSvg(stage);
}
