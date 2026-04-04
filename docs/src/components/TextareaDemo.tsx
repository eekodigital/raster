import { Textarea } from "@eekodigital/raster";

const labelStyle = {
  display: "block",
  fontSize: "var(--font-size-sm)",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-text)",
  marginBottom: "var(--spacing-1)",
} as const;

export function TextareaDefault() {
  return (
    <div style={{ width: "100%" }}>
      <label style={labelStyle} htmlFor="ta-default">
        Notes
      </label>
      <Textarea id="ta-default" name="notes" rows={4} placeholder="Add notes…" />
    </div>
  );
}

export function TextareaError() {
  return (
    <div style={{ width: "100%" }}>
      <label style={labelStyle} htmlFor="ta-error">
        Description
      </label>
      <Textarea
        id="ta-error"
        name="description"
        hasError
        rows={3}
        placeholder="Description required"
      />
    </div>
  );
}

export function TextareaDisabled() {
  return (
    <div style={{ width: "100%" }}>
      <label style={labelStyle} htmlFor="ta-disabled">
        Notes
      </label>
      <Textarea id="ta-disabled" name="notes" defaultValue="Read-only content" disabled rows={3} />
    </div>
  );
}
