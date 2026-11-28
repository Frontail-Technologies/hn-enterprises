export type MapStage = "conversion" | "commissioning" | "gi" | "survey" | "none";

export type CustomerMapPoint = {
  id: string;
  name: string;
  bpNo: string;
  projectId: string | null;
  projectName: string;
  lat: number;
  lng: number;
  stage: MapStage;
};

/** Pin colour and legend label per stage (furthest stage reached). */
export const STAGE_STYLE: Record<MapStage, { label: string; color: string }> = {
  conversion: { label: "Conversion done", color: "#16a34a" },
  commissioning: { label: "Commissioned", color: "#f59e0b" },
  gi: { label: "GI done", color: "#2563eb" },
  survey: { label: "Survey done", color: "#8b5cf6" },
  none: { label: "Not started", color: "#94a3b8" },
};
