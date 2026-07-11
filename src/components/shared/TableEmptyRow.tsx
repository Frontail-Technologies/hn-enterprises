import { TableCell, TableRow } from "@/components/ui/table";

interface TableEmptyRowProps {
  colSpan: number;
  title: string;
  description?: string;
}

export function TableEmptyRow({ colSpan, title, description }: TableEmptyRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-28 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4">
          <p className="text-sm font-bold text-foreground">{title}</p>
          {description ? (
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}
