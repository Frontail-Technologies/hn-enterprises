export type PlumberType = "individual" | "team";
export type PlumberStatus = "active" | "inactive";

export type Plumber = {
  id: string;
  name: string;
  type: PlumberType;
  contactNumber: string;
  status: PlumberStatus;
  remarks: string;
  createdAt: string;
};

export type PlumberFormValues = {
  name: string;
  type: PlumberType;
  contactNumber: string;
  status: PlumberStatus;
  remarks: string;
};
