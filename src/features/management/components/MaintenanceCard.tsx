"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WarningIcon, WrenchIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";

type MaintenanceState = { enabled: boolean; message: string; updatedAt: string | null };

const KEY = ["system", "maintenance"] as const;

/**
 * Maintenance mode for the mobile app: while on, supervisors / managers see a
 * maintenance screen and can't use the app or sign in. Admins and this panel
 * keep working.
 */
export function MaintenanceCard() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: KEY,
    queryFn: () => apiRequest<MaintenanceState>("/system/maintenance"),
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");

  const save = useMutation({
    mutationFn: (body: { enabled: boolean; message?: string }) =>
      apiRequest<MaintenanceState>("/system/maintenance", { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: (state) => {
      queryClient.setQueryData(KEY, state);
      toast.success(state.enabled ? "Maintenance is on. The mobile app is blocked." : "Maintenance is off. The mobile app works again.");
      setConfirmOpen(false);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Couldn't change maintenance mode"),
  });

  const enabled = Boolean(data?.enabled);

  return (
    <section
      className={`rounded-card border bg-card p-4 shadow-card ${enabled ? "border-destructive/50" : "border-border"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${enabled ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}
          >
            <WrenchIcon size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Mobile app maintenance</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {isLoading
                ? "Loading..."
                : isError
                  ? "Couldn't load the current setting. Apply the latest backend migration (0029) and deploy."
                  : enabled
                    ? "On: supervisors and managers can't use the mobile app or sign in."
                    : "Off: the mobile app works normally. Turn it on to block the whole app for supervisors and managers."}
            </p>
            {enabled && data?.message ? (
              <p className="mt-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground">“{data.message}”</p>
            ) : null}
          </div>
        </div>
        {enabled ? (
          <Button type="button" disabled={save.isPending} onClick={() => save.mutate({ enabled: false, message: data?.message })}>
            {save.isPending ? "Saving..." : "Turn off maintenance"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
            disabled={isLoading || isError}
            onClick={() => {
              setMessage(data?.message ?? "");
              setConfirmOpen(true);
            }}
          >
            Turn on maintenance
          </Button>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WarningIcon size={18} className="text-destructive" />
              Block the mobile app?
            </DialogTitle>
            <DialogDescription>
              Every supervisor and manager is stopped right away (within about 15 seconds) and sees this message. Unsaved
              entries on their phones may be lost. Admins are not affected.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="maintenance-message" className="text-sm font-medium">
              Message shown in the app
            </label>
            <Textarea
              id="maintenance-message"
              value={message}
              maxLength={300}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="The app is under maintenance. Please try again in a little while."
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={save.isPending}
              onClick={() => save.mutate({ enabled: true, message: message.trim() || undefined })}
            >
              {save.isPending ? "Saving..." : "Turn on maintenance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
