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
 * The work each stage stands for, drawn inside the pin's white badge
 * (24x24 box centred on the badge, stroke in the stage colour).
 */
const GLYPHS: Record<MapStage, string> = {
  // Not started: an empty dashed ring.
  none: `<circle cx="12" cy="12" r="5.5" fill="none" stroke-dasharray="2.6 2.2"/>`,
  // Survey: clipboard with a tick.
  survey: `<rect x="6.5" y="5.5" width="11" height="13.5" rx="1.8" fill="none"/><path d="M9.5 5.5v-1h5v1" fill="none"/><path d="M9.2 12.4l2 2 3.8-4" fill="none"/>`,
  // GI: pipe with an elbow and a joint.
  gi: `<path d="M5.5 9h7.5a3.5 3.5 0 0 1 3.5 3.5V19" fill="none"/><path d="M5.5 7v4M14.5 19h4" fill="none"/>`,
  // Commissioned: meter dial with a needle.
  commissioning: `<path d="M5.6 15.5a7 7 0 1 1 12.8 0" fill="none"/><path d="M12 14l3.4-3.6" fill="none"/><circle cx="12" cy="14.2" r="1.3"/>`,
  // Conversion: gas flame.
  conversion: `<path d="M12 4.8c.6 2.6 4.6 4.4 4.6 8.6a4.6 4.6 0 0 1-9.2 0c0-1.9 1-3.2 2-4 .1 1.5.8 2.5 1.8 2.9-.6-2.6.2-5.3.8-7.5z" fill="none"/>`,
};

/**
 * A glossy teardrop pin: gradient body lit from the top left, a white badge
 * with the stage's work icon, a thin rim, and a soft ground shadow. The tip
 * sits on the customer's location.
 */
function pinSvg(stage: MapStage) {
  const base = STAGE_STYLE[stage].color;
  const light = shade(base, 0.35);
  const dark = shade(base, -0.38);
  const id = `hnpin-${stage}`;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="34" height="46" viewBox="0 0 34 46" aria-hidden="true">
  <defs>
    <linearGradient id="${id}-body" x1="0.15" y1="0" x2="0.85" y2="1">
      <stop offset="0%" stop-color="${light}"/>
      <stop offset="55%" stop-color="${base}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
    <radialGradient id="${id}-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${id}-gloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <ellipse cx="17" cy="43.2" rx="7.5" ry="2.4" fill="url(#${id}-shadow)"/>
  <path d="M17 42.5C17 42.5 3.5 27.6 3.5 17A13.5 13.5 0 0 1 30.5 17C30.5 27.6 17 42.5 17 42.5Z" fill="url(#${id}-body)" stroke="${dark}" stroke-width="1"/>
  <path d="M7.2 12.8A11 11 0 0 1 26.8 12.8C24 9.4 20.7 8 17 8S10 9.4 7.2 12.8Z" fill="url(#${id}-gloss)"/>
  <circle cx="17" cy="17" r="9.6" fill="#ffffff"/>
  <circle cx="17" cy="17" r="9.6" fill="none" stroke="${dark}" stroke-opacity="0.18" stroke-width="1"/>
  <g transform="translate(5 5)" stroke="${dark}" fill="${dark}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    ${GLYPHS[stage]}
  </g>
</svg>`;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);

const svgCache = new Map<MapStage, string>();
// Same stage + name = same icon object, so re-renders don't rebuild every marker.
const iconCache = new Map<string, L.DivIcon>();

/**
 * Leaflet icon for one customer: the stage pin with the customer's name in a
 * small tag beside it (the tag shows once the map is zoomed in, see
 * .hn-show-labels in globals.css, so a zoomed-out map doesn't turn into text).
 */
export function stagePin(stage: MapStage, name?: string) {
  let svg = svgCache.get(stage);
  if (!svg) {
    svg = pinSvg(stage);
    svgCache.set(stage, svg);
  }
  const key = `${stage}|${name ?? ""}`;
  const cached = iconCache.get(key);
  if (cached) return cached;
  const label = name?.trim()
    ? `<span class="hn-pin-label" style="border-color:${STAGE_STYLE[stage].color}">${escapeHtml(name.trim())}</span>`
    : "";
  const icon = L.divIcon({
    className: "hn-map-pin",
    html: `${svg}${label}`,
    iconSize: [34, 46],
    iconAnchor: [17, 43],
    popupAnchor: [0, -38],
  });
  iconCache.set(key, icon);
  return icon;
}

/** The same pin as markup, for the legend / filters. */
export function stagePinMarkup(stage: MapStage) {
  return pinSvg(stage);
}
