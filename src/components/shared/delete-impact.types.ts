// Mirrors backend/src/modules/deletion/deletion.types.ts - kept as a small,
// independent type file (not generated) since the two sides only need to agree on
// shape, not share code across the JS/TS boundary.

export type DeleteImpactAction = "delete" | "detach" | "preserve" | "block";

export type DeleteImpactPreviewRow = {
  id: string;
  label: string;
};

export type DeleteImpactDependency = {
  key: string;
  label: string;
  count: number;
  action: DeleteImpactAction;
  preview?: DeleteImpactPreviewRow[];
};

export type DeleteImpactBlocker = {
  key: string;
  label: string;
  reason: string;
};

export type DeleteImpactResult = {
  entity: {
    type: string;
    id: string;
    label: string;
  };
  canDelete: boolean;
  totalAffected: number;
  dependencies: DeleteImpactDependency[];
  blockers: DeleteImpactBlocker[];
};
