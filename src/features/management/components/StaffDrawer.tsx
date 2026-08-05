import { useState, type ReactNode } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { DatePicker } from "@/components/shared/DatePicker";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useProjectsQuery } from "@/features/projects/hooks/useProjects";
import { useCreateStaff } from "../hooks/useStaff";
import type { CreateStaffFormValues } from "../types/staff.types";
import type { User, UserRole } from "../services/users.service";

const roles: UserRole[] = ["Super Admin", "Admin", "Supervisor", "Field Executive", "Viewer"];
const salaryTypes: CreateStaffFormValues["salaryType"][] = ["Monthly", "Daily Wage", "Work Basis", "Contract"];
const paymentAccountTypes: CreateStaffFormValues["paymentAccountType"][] = ["Bank Account", "UPI", "Cash", "Other"];

function emptyValues(): CreateStaffFormValues {
  return {
    mode: "new",
    userId: "",
    newUser: { name: "", email: "", username: "", mobile: "", role: "Supervisor", password: "" },
    assignedProjectId: "",
    salaryType: "Monthly",
    monthlySalary: "",
    allowance: "",
    paymentAccountType: "Bank Account",
    bankType: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    upiType: "",
    upiId: "",
    salaryEffectiveFrom: "",
    lastSalaryRevisionDate: "",
    nextSalaryReviewDate: "",
    remarks: "",
  };
}

export function StaffDrawer({ users, staffedUserIds }: { users: User[]; staffedUserIds: Set<string> }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<CreateStaffFormValues>(emptyValues());
  const [saveError, setSaveError] = useState("");
  const { data: projects = [] } = useProjectsQuery();
  const createStaff = useCreateStaff();
  const availableUsers = users.filter((user) => !staffedUserIds.has(user.id));

  function set<K extends keyof CreateStaffFormValues>(key: K, value: CreateStaffFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function setNewUser<K extends keyof CreateStaffFormValues["newUser"]>(key: K, value: CreateStaffFormValues["newUser"][K]) {
    setValues((current) => ({ ...current, newUser: { ...current.newUser, [key]: value } }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(emptyValues());
      setSaveError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (values.mode === "existing" && !values.userId) {
      setSaveError("Select a user to link");
      return;
    }
    if (values.mode === "new") {
      if (!values.newUser.name.trim() || !values.newUser.username.trim() || !values.newUser.email.trim()) {
        setSaveError("Name, username and email are required for a new user");
        return;
      }
      if (values.newUser.password.length < 8) {
        setSaveError("Password must be at least 8 characters");
        return;
      }
    }
    setSaveError("");
    try {
      await createStaff.mutateAsync(values);
      setOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to create staff record");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button type="button" />}>
        <PlusIcon size={15} />
        Add Staff
      </SheetTrigger>
      <SheetContent className="w-full border-border bg-card sm:max-w-lg">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Add Staff</SheetTitle>
          <SheetDescription>
            Link an existing login or create a new one — payroll details attach to that account.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <Field label="Account">
            <Select value={values.mode} onValueChange={(mode) => { if (mode) set("mode", mode as "existing" | "new"); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Create new user</SelectItem>
                <SelectItem value="existing">Link existing user</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {values.mode === "existing" ? (
            <Field label="User">
              <Select value={values.userId || undefined} onValueChange={(userId) => set("userId", userId ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a user without a staff record" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : (
            <>
              <Field label="Name">
                <Input value={values.newUser.name} onChange={(event) => setNewUser("name", event.target.value)} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Username">
                  <Input value={values.newUser.username} onChange={(event) => setNewUser("username", event.target.value)} />
                </Field>
                <Field label="Email">
                  <Input type="email" value={values.newUser.email} onChange={(event) => setNewUser("email", event.target.value)} />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Mobile">
                  <Input value={values.newUser.mobile} onChange={(event) => setNewUser("mobile", event.target.value)} />
                </Field>
                <Field label="Role">
                  <Select value={values.newUser.role} onValueChange={(role) => { if (role) setNewUser("role", role as UserRole); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Initial Password">
                <Input type="password" value={values.newUser.password} onChange={(event) => setNewUser("password", event.target.value)} />
              </Field>
            </>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Assigned Project">
              <SearchableSelect
                value={values.assignedProjectId || undefined}
                onValueChange={(assignedProjectId) => set("assignedProjectId", assignedProjectId ?? "")}
                placeholder="Select project"
                options={projects.map((p) => ({ value: p.id, label: p.name }))}
                className="w-full"
              />
            </Field>
            <Field label="Salary Type">
              <Select value={values.salaryType} onValueChange={(salaryType) => { if (salaryType) set("salaryType", salaryType as CreateStaffFormValues["salaryType"]); }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {salaryTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Monthly Salary">
              <Input type="number" value={values.monthlySalary} onChange={(event) => set("monthlySalary", event.target.value)} />
            </Field>
            <Field label="Allowance">
              <Input type="number" value={values.allowance} onChange={(event) => set("allowance", event.target.value)} />
            </Field>
          </div>

          <Field label="Payment Type">
            <Select
              value={values.paymentAccountType}
              onValueChange={(type) => { if (type) set("paymentAccountType", type as CreateStaffFormValues["paymentAccountType"]); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentAccountTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {values.paymentAccountType === "Bank Account" ? (
            <>
              <Field label="Bank Name">
                <Input value={values.bankName} onChange={(event) => set("bankName", event.target.value)} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Account Number">
                  <Input value={values.accountNumber} onChange={(event) => set("accountNumber", event.target.value)} />
                </Field>
                <Field label="IFSC Code">
                  <Input value={values.ifscCode} onChange={(event) => set("ifscCode", event.target.value)} />
                </Field>
              </div>
            </>
          ) : null}

          {values.paymentAccountType === "UPI" ? (
            <Field label="UPI ID">
              <Input value={values.upiId} onChange={(event) => set("upiId", event.target.value)} />
            </Field>
          ) : null}

          {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={createStaff.isPending}>
              {createStaff.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
