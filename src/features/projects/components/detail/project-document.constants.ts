import { format } from "date-fns";
import type { ProjectDocument } from "../../types/project.types";

export const documentCategories = [
  { type: "Contract", label: "Contract", numberLabel: "Contract No.", amountLabel: "Contract Amount" },
  { type: "Work Order", label: "Work Order", numberLabel: "WO No.", amountLabel: "WO Amount" },
  { type: "BOQ", label: "BOQ", numberLabel: "BOQ No.", amountLabel: "Amount" },
  { type: "Drawing", label: "Drawing", numberLabel: "Drawing No.", amountLabel: "Amount" },
  { type: "Billing", label: "Billing", numberLabel: "Reference No.", amountLabel: "Amount" },
  { type: "Approval", label: "Approval", numberLabel: "Reference No.", amountLabel: "Amount" },
  { type: "Other", label: "Other", numberLabel: "Reference No.", amountLabel: "Amount" },
];

export const emptyDocument: ProjectDocument = {
  id: "new",
  type: "Other",
  number: "",
  documentName: "",
  documentDate: "",
  contractDate: "",
  issueDate: "",
  expiryDate: "",
  amount: "",
  category: "Other",
  fileName: "document.pdf",
  remarks: "",
  uploadedOn: format(new Date(), "yyyy-MM-dd"),
  uploadedBy: "Demo Admin",
};
