"use client";

import { useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// A self-rendering, uncontrolled form field for quick mock "Add" drawers/forms
// that don't wire up real state. For fields that need real values/children,
// use FormField instead.
export function QuickField({
  label,
  select,
  textarea,
  password,
  date,
  options = [],
}: {
  label: string;
  select?: boolean;
  textarea?: boolean;
  password?: boolean;
  date?: boolean;
  options?: string[];
}) {
  const [dateValue, setDateValue] = useState("");

  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      {select ? (
        <Select defaultValue={options[0]}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : textarea ? (
        <Textarea className="min-h-24" />
      ) : date ? (
        <DatePicker value={dateValue} onChange={setDateValue} placeholder="Select date" />
      ) : (
        <Input type={password ? "password" : "text"} />
      )}
    </label>
  );
}
