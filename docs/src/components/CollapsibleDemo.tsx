import { Collapsible } from "@eekodigital/raster";

export function CollapsibleBasicDemo() {
  return (
    <Collapsible.Root style={{ width: "100%" }}>
      <Collapsible.Trigger>Audit scope</Collapsible.Trigger>
      <Collapsible.Content>
        This audit covers financial controls, data governance, and HR policy compliance for the
        period January–December 2024.
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export function CollapsibleOpenDemo() {
  return (
    <Collapsible.Root defaultOpen style={{ width: "100%" }}>
      <Collapsible.Trigger>Findings summary</Collapsible.Trigger>
      <Collapsible.Content>
        3 critical findings, 7 serious, 12 moderate. All critical findings require remediation
        within 30 days.
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
