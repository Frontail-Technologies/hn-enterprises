"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * The open tab, kept in the address (`?tab=...` by default) so refresh, back
 * and shared links keep it. The default tab leaves the address clean. Tab ids
 * with spaces ("Payment Types") are written as slugs ("payment-types").
 */
export function useUrlTab<T extends string>(values: readonly T[], fallback: T, key = "tab"): [T, (next: T) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get(key);
  const current = (requested ? values.find((value) => slug(value) === requested) : undefined) ?? fallback;

  const setTab = useCallback(
    (next: T) => {
      const params = new URLSearchParams(window.location.search);
      if (next === fallback) params.delete(key);
      else params.set(key, slug(next));
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [fallback, key, pathname, router],
  );

  return [current, setTab];
}
