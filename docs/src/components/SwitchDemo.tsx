import { Switch } from "@eekodigital/raster";

export function SwitchDemo() {
  return (
    <Switch.Root aria-label="Enable feature">
      <Switch.Thumb />
    </Switch.Root>
  );
}

export function SwitchCheckedDemo() {
  return (
    <Switch.Root defaultChecked aria-label="Enable feature">
      <Switch.Thumb />
    </Switch.Root>
  );
}

export function SwitchLabelDemo() {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        cursor: "pointer",
        fontSize: "var(--font-size-sm)",
      }}
    >
      Enable notifications
      <Switch.Root name="notifications">
        <Switch.Thumb />
      </Switch.Root>
    </label>
  );
}

export function SwitchDisabledDemo() {
  return (
    <Switch.Root disabled aria-label="Enable feature">
      <Switch.Thumb />
    </Switch.Root>
  );
}
