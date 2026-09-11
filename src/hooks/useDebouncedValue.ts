import { useEffect, useState } from "react";

/**
 * Debounces a fast-changing value (e.g. a search input) so consumers - remote
 * search queries in particular - don't re-fetch on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
