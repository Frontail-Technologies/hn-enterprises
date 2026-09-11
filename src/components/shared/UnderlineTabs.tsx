import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <Tabs value={active} onValueChange={(value) => value && onChange(String(value))} className="min-w-0">
      <TabsList variant="line" className="w-full min-w-0 max-w-full">
        {items.map((item) => (
          <TabsTrigger key={item.id} value={item.id}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
