import { TextInput } from "@eekodigital/raster";

const labelStyle = {
  display: "block",
  fontSize: "var(--font-size-sm)",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-text)",
  marginBottom: "var(--spacing-1)",
} as const;

export function TextInputDefault() {
  return (
    <div style={{ width: "100%" }}>
      <label style={labelStyle} htmlFor="ti-default">
        Search
      </label>
      <TextInput id="ti-default" name="query" placeholder="Search…" />
    </div>
  );
}

export function TextInputError() {
  return (
    <div style={{ width: "100%" }}>
      <label style={labelStyle} htmlFor="ti-error">
        Email address
      </label>
      <TextInput id="ti-error" name="email" type="email" hasError placeholder="name@example.com" />
    </div>
  );
}

export function TextInputDisabled() {
  return (
    <div style={{ width: "100%" }}>
      <label style={labelStyle} htmlFor="ti-disabled">
        Reference number
      </label>
      <TextInput id="ti-disabled" name="ref" defaultValue="INV-0042" disabled />
    </div>
  );
}
