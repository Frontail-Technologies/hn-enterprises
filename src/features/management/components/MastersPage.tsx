"use client";

import { HolidaysTab } from "./masters/HolidaysTab";
import { MasterValuesTab } from "./masters/MasterValuesTab";
import { masterTabs, type MasterTabId, type MasterValueCategory } from "../types/masters.types";
import { useUrlTab } from "@/hooks/useUrlTab";

export function MastersPage() {
  const [activeTab, setActiveTab] = useUrlTab<MasterTabId>(masterTabs.map((tab) => tab.id), "Payment Types");

  if (activeTab === "Holidays") {
    return <HolidaysTab activeTab={activeTab} onTabChange={setActiveTab} />;
  }
  return (
    <MasterValuesTab
      key={activeTab}
      activeTab={activeTab as MasterValueCategory}
      onTabChange={setActiveTab}
    />
  );
}
