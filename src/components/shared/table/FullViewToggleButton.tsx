import { CornersInIcon, CornersOutIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

/**
 * Compact, icon-first expand/collapse toggle for a table's Full View mode -
 * conventional maximize icon when collapsed, minimize icon when active.
 * Tooltip + accessible label always present; never a large labeled button.
 */
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
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      {active ? <CornersInIcon size={15} /> : <CornersOutIcon size={15} />}
    </Button>
  );
}
