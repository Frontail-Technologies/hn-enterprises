
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
