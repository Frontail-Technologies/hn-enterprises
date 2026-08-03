export type ComplaintPriority = "Low" | "Medium" | "High";
export type ComplaintStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export type Complaint = {
  id: string;
  customerId: string;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  supervisorRemark: string;
  createdAt: string;
};

export type ComplaintFormValues = {
  customerId: string;
  title: string;
  description: string;
  priority: ComplaintPriority;
};
