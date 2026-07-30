import type { ReactNode } from "react";
import { DrawerShell } from "@/components/shared/DrawerShell";
import { QuickField } from "@/components/shared/QuickField";
import { materials } from "../../data/materials.data";
import { ImageProofField } from "../shared/ImageProofField";

export function MaterialDrawer({
  action,
  icon,
  iconOnly = false,
}: {
  action: string;
  icon?: ReactNode;
  iconOnly?: boolean;
}) {
  const description = getDescription(action);

  return (
    <DrawerShell
      title={action}
      description={description}
      triggerLabel={action}
      icon={icon}
      iconOnly={iconOnly}
    >
      <InventoryDrawerFields action={action} />
    </DrawerShell>
  );
}

function InventoryDrawerFields({ action }: { action: string }) {
  if (action === "Add Purchase") {
    return (
      <>
        <QuickField label="Invoice No." />
        <QuickField label="Vendor Name" />
        <QuickField label="Purchase Date" date />
        <QuickField
          label="Material"
          select
          options={materials.map((row) => row.name)}
        />
        <QuickField label="Quantity" />
        <QuickField label="Rate" />
        <QuickField label="Bill Amount" />
        <ImageProofField
          label="Purchase Bill / Receipt"
          description="Upload vendor bill, receipt or material purchase proof."
        />
        <QuickField label="Remarks" textarea />
      </>
    );
  }

  if (action === "Add PBG Issue") {
    return (
      <>
        <QuickField label="SIV No." />
        <QuickField label="Person" />
        <QuickField label="Issue Date" date />
        <QuickField
          label="Material"
          select
          options={materials.map((row) => row.name)}
        />
        <QuickField label="Tender Scope" />
        <QuickField label="Balance" />
        <QuickField label="BG Total Issue Store" />
        <QuickField label="Vehicle No." />
        <QuickField label="Vehicle Quantity" />
        <ImageProofField
          label="SIV / Handover Proof"
          description="Upload free-issue challan, receipt or vehicle proof."
        />
        <QuickField label="Remarks" textarea />
      </>
    );
  }

  if (action === "Add PBG Consumption") {
    return (
      <>
        <QuickField label="RA Bill No." />
        <QuickField label="Consumption Date" date />
        <QuickField
          label="Material"
          select
          options={materials.map((row) => row.name)}
        />
        <QuickField label="Total Consumption" />
        <QuickField label="Vendor Name" />
        <ImageProofField
          label="Consumption Proof"
          description="Upload RA bill or consumption supporting document."
        />
        <QuickField label="Remarks" textarea />
      </>
    );
  }

  if (action === "Issue Material") {
    return (
      <>
        <QuickField label="Slip No." />
        <QuickField label="Issue Date" date />
        <QuickField label="Plumber / Team" />
        <QuickField label="Supervisor" />
        <QuickField label="Site" />
        <QuickField
          label="Material"
          select
          options={materials.map((row) => row.name)}
        />
        <QuickField label="Issued Quantity" />
        <ImageProofField
          label="Issue Slip / Handover Proof"
          description="Upload store issue slip or handover proof image."
        />
        <QuickField label="Remarks" textarea />
      </>
    );
  }

  if (action === "Return Material") {
    return (
      <>
        <QuickField label="Return No." />
        <QuickField label="Return Date" date />
        <QuickField label="Plumber / Team" />
        <QuickField label="Site" />
        <QuickField
          label="Material"
          select
          options={materials.map((row) => row.name)}
        />
        <QuickField label="Return Quantity" />
        <QuickField
          label="Condition"
          select
          options={["Reusable", "Damaged", "Scrap", "Review"]}
        />
        <ImageProofField
          label="Return Slip / Material Photo"
          description="Upload return slip or returned material proof."
        />
        <QuickField label="Remarks" textarea />
      </>
    );
  }

  if (action === "Adjust Balance") {
    return (
      <>
        <QuickField label="Plumber / Team" />
        <QuickField
          label="Material"
          select
          options={materials.map((row) => row.name)}
        />
        <QuickField label="Adjustment Quantity" />
        <QuickField
          label="Adjustment Type"
          select
          options={["Correction", "Damaged", "Lost", "Found", "Manual Adjustment"]}
        />
        <ImageProofField
          label="Adjustment Proof"
          description="Upload approval or physical verification proof."
        />
        <QuickField label="Reason / Remarks" textarea />
      </>
    );
  }

  if (action === "Add Consumption") {
    return (
      <>
        <QuickField label="Customer / BP No." />
        <QuickField label="Site" />
        <QuickField label="Plumber / Team" />
        <QuickField label="Supervisor" />
        <QuickField label="Report No." />
        <QuickField label="Consumption Date" date />
        <QuickField
          label="Material"
          select
          options={materials.map((row) => row.name)}
        />
        <QuickField label="Used Quantity" />
        <ImageProofField
          label="Report / Site Proof"
          description="Upload report, site photo or material usage proof."
        />
        <QuickField label="Remarks" textarea />
      </>
    );
  }

  return (
    <>
      <QuickField
        label="Material"
        select
        options={materials.map((row) => row.name)}
      />
      <QuickField label="Store / Site" />
      <QuickField label="Quantity" />
      <QuickField label="Transaction Date" date />
      <ImageProofField
        label="Bill / Receipt Photo"
        description="Upload material bill, store receipt or handover proof image."
      />
      <QuickField label="Remarks" textarea />
    </>
  );
}

function getDescription(action: string) {
  switch (action) {
    case "Add Purchase":
      return "Record vendor invoice, material quantity, rate and bill proof.";
    case "Add PBG Issue":
      return "Record free-issue material received from client/vendor.";
    case "Add PBG Consumption":
      return "Record PBG material consumption against RA bill/reference.";
    case "Issue Material":
      return "Issue material to plumber, team or site with handover proof.";
    case "Return Material":
      return "Record material returned by plumber or site team.";
    case "Adjust Balance":
      return "Correct plumber balance after physical verification.";
    case "Add Consumption":
      return "Record customer/site material consumption for reconciliation.";
    default:
      return "Maintain stock movement with receipt/photo reference.";
  }
}
