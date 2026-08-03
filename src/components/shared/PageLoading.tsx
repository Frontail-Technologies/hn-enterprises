import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "@/lib/utils";

export function PageLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-h-40 items-center justify-center p-6", className)}>
      <LoadingSpinner />
    </div>
  );
}
