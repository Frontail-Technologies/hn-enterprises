import { CornersInIcon, CornersOutIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function FullViewToggleButton({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  const label = active ? "Exit full view" : "Full view";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      {active ? <CornersInIcon size={13} /> : <CornersOutIcon size={13} />}
    </Button>
  );
}
