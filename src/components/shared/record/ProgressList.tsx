import Link from "next/link";
import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

/** `href` makes the row a link (e.g. to the records behind the number). */
export type ProgressItem = { label: string; value: number; total: number; href?: string };

const pct = (value: number, total: number) => (total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0);

function Row({ item }: { item: ProgressItem }) {
  const percent = pct(item.value, item.total);
  return (
    <>
      <div className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className={cn("inline-flex items-center gap-1 font-medium text-foreground", item.href && "group-hover:text-primary")}>
          {item.label}
          {item.href ? (
            <CaretRightIcon size={12} aria-hidden="true" className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
          ) : null}
        </span>
        <span className="text-muted-foreground tabular-nums">
          <b className="font-semibold text-foreground">{item.value.toLocaleString("en-IN")}</b> / {item.total.toLocaleString("en-IN")}
          <span className="ms-2 inline-block w-9 text-right">{percent}%</span>
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={item.label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn("h-full rounded-full", percent >= 100 ? "bg-success" : "bg-primary")} style={{ width: `${percent}%` }} />
      </div>
    </>
  );
}

/** "Done out of total" as labelled bars — reads faster than a row of fraction cards. */
export function ProgressList({ items, className }: { items: ProgressItem[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-1.5", className)}>
      {items.map((item) => (
        <li key={item.label}>
          {item.href ? (
            <Link
              href={item.href}
              title={`View ${item.label.toLowerCase()} customers`}
              className="group -mx-2 flex flex-col gap-1.5 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Row item={item} />
            </Link>
          ) : (
            <div className="flex flex-col gap-1.5 py-1.5">
              <Row item={item} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
