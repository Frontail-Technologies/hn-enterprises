const customerSectionLinksBeforeGroups = [
  { href: "#customer-details", label: "Customer Details" },
  { href: "#survey", label: "Survey" },
  { href: "#gi", label: "GI Measurements" },
  { href: "#isolation", label: "Isolation & Fittings" },
  { href: "#lmc", label: "LMC Pipeline" },
  { href: "#mdpe", label: "MDPE Fittings" },
  { href: "#commissioning", label: "Meter & Commissioning" },
  { href: "#progress-milestones", label: "Progress Milestones" },
  { href: "#billing", label: "Billing & Remarks" },
  { href: "#notes", label: "Notes" },
  { href: "#documents", label: "Images / Evidence" },
  { href: "#reports", label: "Reports" },
  { href: "#complaints", label: "Complaints" },
];

const customerSectionLinksAfterGroups = [{ href: "#approvals", label: "Approvals / History" }];

export function groupAnchorId(group: string) {
  return `custom-${group.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

/**
 * Builds the CustomerDetail section-nav anchor list: the fixed sections
 * plus one entry per visible dynamic custom-field group.
 */
export function buildCustomerSectionLinks(visibleGroupNames: string[]) {
  return [
    ...customerSectionLinksBeforeGroups,
    ...visibleGroupNames.map((group) => ({ href: `#${groupAnchorId(group)}`, label: group })),
    ...customerSectionLinksAfterGroups,
  ];
}
