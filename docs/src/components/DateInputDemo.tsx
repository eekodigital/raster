import { useState } from "react";
import { DateInput } from "@eekodigital/raster";
import type { DateValue } from "@eekodigital/raster";

export function DateInputDemo() {
  const [value, setValue] = useState<DateValue>({ day: "", month: "", year: "" });
  return (
    <div>
      <DateInput label="Date of birth" value={value} onChange={setValue} />
      {(value.day || value.month || value.year) && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--color-text-subtle)" }}>
          {value.day}/{value.month}/{value.year}
        </p>
      )}
    </div>
  );
}

export function DateInputErrorDemo() {
  return (
    <DateInput
      label="Date of audit"
      hint="For example, 27 3 2025"
      error="Enter a valid date"
      defaultValue={{ day: "32", month: "13", year: "2025" }}
    />
  );
}
