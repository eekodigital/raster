import { Select } from "@eekodigital/raster";

const OPTIONS = [
  { value: "wcag-2.2", label: "WCAG 2.2" },
  { value: "wcag-3.0", label: "WCAG 3.0 (beta)" },
];

export function SelectDemo() {
  return (
    <Select
      name="standard"
      placeholder="Choose a standard…"
      options={OPTIONS}
      aria-label="Standard"
    />
  );
}

export function SelectErrorDemo() {
  return (
    <Select
      name="standard"
      hasError
      placeholder="Choose a standard…"
      options={OPTIONS}
      aria-label="Standard"
    />
  );
}

export function SelectDisabledDemo() {
  return (
    <Select
      name="standard"
      defaultValue="wcag-2.2"
      disabled
      options={OPTIONS}
      aria-label="Standard"
    />
  );
}
