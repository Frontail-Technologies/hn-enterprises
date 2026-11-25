/** Plumbers are picked on customers; labour only for payments, wages and material. */
export type PlumberCategory = "plumber" | "labour";
export type PlumberType = "individual" | "team";
export type PlumberStatus = "active" | "inactive";

export type Plumber = {
  id: string;
  name: string;
  category: PlumberCategory;
  type: PlumberType;
  contactNumber: string;
  /** Profile photo URL ("" = none). */
  avatarUrl: string;
  status: PlumberStatus;
  remarks: string;
  createdAt: string;
  /** Projects they are currently on. */
  projectNames: string[];
};

export type PlumberFormValues = {
  name: string;
  category: PlumberCategory;
  type: PlumberType;
  contactNumber: string;
  /** "" removes the photo. */
  avatarUrl: string;
  status: PlumberStatus;
  remarks: string;
};
