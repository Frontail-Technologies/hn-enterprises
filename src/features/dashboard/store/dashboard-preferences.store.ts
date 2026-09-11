import { create } from "zustand";
import { persist } from "zustand/middleware";

type DashboardPreferencesState = {
  selectedMetricIds: string[];
  hasCustomized: boolean;
  setSelectedMetricIds: (ids: string[]) => void;
};

export const useDashboardPreferencesStore = create<DashboardPreferencesState>()(
  persist(
    (set) => ({
      selectedMetricIds: [],
      hasCustomized: false,
      setSelectedMetricIds: (ids) => set({ selectedMetricIds: ids, hasCustomized: true }),
    }),
    { name: "hn-dashboard-preferences" },
  ),
);
