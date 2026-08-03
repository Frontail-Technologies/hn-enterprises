import { cn } from "@/lib/utils";

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}) {
  const sizeMap = { sm: "w-4 h-4", md: "w-7 h-7", lg: "w-10 h-10" };

  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex items-center justify-center", className)}
    >
      <div
        className={cn(
          sizeMap[size],
          "rounded-full border-2 border-border border-t-primary animate-spin",
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
