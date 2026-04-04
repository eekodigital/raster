import { Checkbox, CheckboxGroup } from "@eekodigital/raster";

export function CheckboxGroupDemo() {
  return (
    <CheckboxGroup legend="Notify me about">
      <Checkbox label="New reports" name="notify_reports" />
      <Checkbox label="Criterion status changes" name="notify_status" />
      <Checkbox label="Report locks and unlocks" name="notify_locks" />
    </CheckboxGroup>
  );
}

export function CheckboxGroupHintErrorDemo() {
  return (
    <CheckboxGroup
      legend="Notify me about"
      hint="You can change this later in settings."
      error="Select at least one notification type."
    >
      <Checkbox label="New reports" name="notify_reports2" />
      <Checkbox label="Criterion status changes" name="notify_status2" />
    </CheckboxGroup>
  );
}
