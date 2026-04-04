import { TextareaField } from "@eekodigital/raster";

export function TextareaCharCountDemo() {
  return <TextareaField label="Description" maxLength={200} hint="Describe the issue in detail" />;
}

export function TextareaCharCountOverDemo() {
  return (
    <TextareaField
      label="Short note"
      maxLength={20}
      defaultValue="This text is too long and will overflow the limit"
    />
  );
}
