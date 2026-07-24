import { cn } from "@/lib/utils";

export function UnderlineTabs({
  items,
  active,
  onChange,
}: {
  items: Array<{ id: string; label: string }>;
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex min-w-0 gap-6 overflow-x-auto border-b border-border/70">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "h-9 w-fit shrink-0 cursor-pointer border-b-2 px-0.5 text-sm font-medium transition-colors",
            active === item.id
              ? "border-b-primary text-primary font-semibold"
              : "border-b-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
