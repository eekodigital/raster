import { Radio, RadioGroup } from "@eekodigital/raster";

export function RadioGroupDemo() {
  return (
    <RadioGroup legend="Export format" name="format">
      <Radio label="PDF" value="pdf" />
      <Radio label="CSV" value="csv" />
      <Radio label="JSON" value="json" />
    </RadioGroup>
  );
}

export function RadioGroupHintErrorDemo() {
  return (
    <RadioGroup
      legend="Export format"
      name="format2"
      hint="Choose the format that best suits your workflow."
      error="Please select an export format."
    >
      <Radio label="PDF" value="pdf" />
      <Radio label="CSV" value="csv" />
    </RadioGroup>
  );
}
