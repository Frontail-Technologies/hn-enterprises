export type ComplaintPriority = "Low" | "Medium" | "High";
export type ComplaintStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export type ComplaintCustomer = {
  id: string;
  name: string;
  trBpNumber: string;
  mobileNumber: string;
};

export type Complaint = {
  id: string;
  customerId: string;
  /**
   * Server-joined customer identity (name + BR/TR) - present on list()
   * responses, absent on create()/update() (which return the raw row).
   * Consumers should use this instead of separately fetching the whole
   * customer dataset just to resolve a name.
   */
  customer?: ComplaintCustomer;
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
