"use client";

import { useState } from "react";
import { HolidaysTab } from "./masters/HolidaysTab";
import { MasterValuesTab } from "./masters/MasterValuesTab";
import type { MasterTabId, MasterValueCategory } from "../types/masters.types";

export function MastersPage() {
  const [activeTab, setActiveTab] = useState<MasterTabId>("Payment Types");

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
