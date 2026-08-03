import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./LoadingSpinner";

interface TableLoaderProps {
  colSpan: number;
  className?: string;
}

export function TableLoader({ colSpan, className }: TableLoaderProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className={cn("h-28 text-center", className)}>
        <div className="flex items-center justify-center py-4">
          <LoadingSpinner />
        </div>
      </TableCell>
    </TableRow>
  );
}
