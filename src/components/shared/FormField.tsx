import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FormField({
  label,
  children,
  className,
  required,
  helper,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
  helper?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
      {helper ? <span className="block text-[11px] text-muted-foreground">{helper}</span> : null}
    </div>
  );
}
