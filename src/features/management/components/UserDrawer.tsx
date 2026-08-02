import { useState, type ReactNode } from "react";
import { NotePencilIcon, PlusIcon } from "@phosphor-icons/react";
import { ActionTooltip } from "@/components/shared/ActionTooltip";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { useCreateUser, useResetUserPassword, useUpdateUser } from "../hooks/useUsers";
import type { User, UserRole, UserStatus } from "../services/users.service";

const roles: UserRole[] = ["Super Admin", "Admin", "Supervisor", "Field Executive", "Viewer"];
const statuses: UserStatus[] = ["Active", "Inactive", "Suspended"];

type Draft = {
  name: string;
  username: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  password: string;
};

function emptyDraft(): Draft {
  return { name: "", username: "", email: "", mobile: "", role: "Viewer", status: "Active", password: "" };
}

function draftFromUser(user: User): Draft {
  return {
    name: user.name,
    username: user.username,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    status: user.status,
    password: "",
  };
}

export function UserDrawer({
  user,
  iconOnly = false,
}: {
  user?: User;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(user ? draftFromUser(user) : emptyDraft());
  const [newPassword, setNewPassword] = useState("");
  const [saveError, setSaveError] = useState("");
  const createUser = useCreateUser();
  const updateUser = useUpdateUser(user?.id ?? "");
  const resetPassword = useResetUserPassword(user?.id ?? "");
  const isSaving = createUser.isPending || updateUser.isPending || resetPassword.isPending;
  const label = user ? "Edit User" : "Add User";

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(user ? draftFromUser(user) : emptyDraft());
      setNewPassword("");
      setSaveError("");
    }
    setOpen(nextOpen);
  }

  async function handleSave() {
    if (!draft.name.trim() || !draft.username.trim() || !draft.email.trim()) {
      setSaveError("Name, username and email are required");
      return;
    }
    if (!user && draft.password.length < 8) {
      setSaveError("Password must be at least 8 characters");
      return;
    }
    setSaveError("");
    try {
      if (user) {
        await updateUser.mutateAsync(draft);
        if (newPassword) await resetPassword.mutateAsync(newPassword);
      } else {
        await createUser.mutateAsync(draft);
      }
      setOpen(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to save user");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {iconOnly ? (
        <ActionTooltip label={label}>
          <SheetTrigger
            render={
              <button
                type="button"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                aria-label={label}
              />
            }
          >
            <NotePencilIcon size={15} />
          </SheetTrigger>
        </ActionTooltip>
      ) : (
        <SheetTrigger render={<Button type="button" />}>
          <PlusIcon size={15} />
          {label}
        </SheetTrigger>
      )}
      <SheetContent className="w-full border-border bg-card sm:max-w-md">
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>{label}</SheetTitle>
          <SheetDescription>
            {user ? "Update access, role or reset the password." : "Create a real login with an initial password."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-4">
          <Field label="Name">
            <Input value={draft.name} onChange={(event) => set("name", event.target.value)} />
          </Field>
          <Field label="Mobile">
            <Input value={draft.mobile} onChange={(event) => set("mobile", event.target.value)} />
          </Field>
          <Field label="Username">
            <Input value={draft.username} onChange={(event) => set("username", event.target.value)} disabled={Boolean(user)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={draft.email} onChange={(event) => set("email", event.target.value)} disabled={Boolean(user)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Role">
              <Select value={draft.role} onValueChange={(role) => { if (role) set("role", role as UserRole); }}>
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
            <Field label="Status">
              <Select value={draft.status} onValueChange={(status) => { if (status) set("status", status as UserStatus); }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {user ? (
            <div className="rounded-lg border border-border/70 bg-secondary/35 p-3">
              <p className="text-sm font-semibold text-foreground">Reset Password</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Leave blank if you do not want to change it.
              </p>
              <div className="mt-3">
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
            </div>
          ) : (
            <Field label="Password">
              <Input type="password" value={draft.password} onChange={(event) => set("password", event.target.value)} />
            </Field>
          )}

          {saveError ? <p className="text-xs text-destructive">{saveError}</p> : null}
        </div>

        <SheetFooter className="border-t border-border/70">
          <div className="flex items-center justify-end gap-2">
            <SheetClose render={<Button type="button" variant="outline" />}>Cancel</SheetClose>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
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
