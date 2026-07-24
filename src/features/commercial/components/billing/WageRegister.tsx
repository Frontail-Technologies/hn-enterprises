import type { ReactNode } from "react";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { wageRegisterRows } from "../../data/wages.data";
import { money } from "../../utils/format";

export function WageRegister() {
  return (
    <section className="rounded-lg border border-border/70 bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Wage Register</p>
          <p className="text-xs text-muted-foreground">
            Payroll-style register with attendance days, deductions and net
            payment.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="may-2026">
            <SelectTrigger className="h-8 w-[150px] bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="may-2026">May 2026</SelectItem>
              <SelectItem value="apr-2026">April 2026</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="sm">
            <DownloadSimpleIcon size={14} />
            Export Wage Sheet
          </Button>
        </div>
      </div>
      <div className="overflow-y-auto">
        <div className="flex min-w-0">
          <div className="shrink-0 border-r border-border/70">
            <table className="w-max border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <RegisterHeaderCell className="w-16 min-w-16">
                    Sl No.
                  </RegisterHeaderCell>
                  <RegisterHeaderCell className="w-52 min-w-52">
                    Name
                  </RegisterHeaderCell>
                  <RegisterHeaderCell className="w-36 min-w-36">
                    Category
                  </RegisterHeaderCell>
                </tr>
              </thead>
              <tbody>
                {wageRegisterRows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-muted/25">
                    <RegisterBodyCell className="text-center font-medium">
                      {index + 1}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="font-medium text-foreground">
                      {row.name}
                    </RegisterBodyCell>
                    <RegisterBodyCell>{row.category}</RegisterBodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto">
            <table className="min-w-max border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <RegisterHeaderCell className="w-32 min-w-32 text-right">
                    Rate of Wage
                  </RegisterHeaderCell>
                  <RegisterHeaderCell className="w-32 min-w-32 text-center">
                    Days Worked
                  </RegisterHeaderCell>
                  <RegisterHeaderCell className="w-32 min-w-32 text-right">
                    Basic
                  </RegisterHeaderCell>
                  <RegisterHeaderCell className="w-32 min-w-32 text-right">
                    Total
                  </RegisterHeaderCell>
                  <RegisterHeaderCell className="w-28 min-w-28 text-right">
                    PF
                  </RegisterHeaderCell>
                  <RegisterHeaderCell className="w-28 min-w-28 text-right">
                    ESIC
                  </RegisterHeaderCell>
                  <RegisterHeaderCell className="w-36 min-w-36 text-right">
                    Total Deduction
                  </RegisterHeaderCell>
                  <RegisterHeaderCell className="w-36 min-w-36 text-right">
                    Net Payment
                  </RegisterHeaderCell>
                  <RegisterHeaderCell className="w-32 min-w-32 text-center">
                    Status
                  </RegisterHeaderCell>
                  <RegisterHeaderCell className="w-28 min-w-28 text-center">
                    Signature
                  </RegisterHeaderCell>
                </tr>
              </thead>
              <tbody>
                {wageRegisterRows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/25">
                    <RegisterBodyCell className="text-right">
                      {money(row.wageRate)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-center font-medium">
                      {row.daysWorked}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right">
                      {money(row.basic)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right">
                      {money(row.total)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right">
                      {money(row.pf)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right">
                      {money(row.esic)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right">
                      {money(row.totalDeduction)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-right font-semibold">
                      {money(row.netPayment)}
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-center">
                      <StatusBadge status={row.status} />
                    </RegisterBodyCell>
                    <RegisterBodyCell className="text-center text-muted-foreground">
                      -
                    </RegisterBodyCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function RegisterHeaderCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "sticky top-0 z-10 h-11 border-b border-r border-border/70 bg-secondary/90 px-2 py-2 text-left align-middle text-xs font-semibold text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

function RegisterBodyCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "h-10 border-b border-r border-border/55 bg-card px-2 py-2 text-sm text-foreground",
        className,
      )}
    >
      {children}
    </td>
  );
}
