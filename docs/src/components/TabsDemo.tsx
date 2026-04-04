import { Tabs } from "@eekodigital/raster";

export function TabsDemo() {
  return (
    <Tabs.Root defaultValue="overview" style={{ width: "100%" }}>
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="details">Details</Tabs.Trigger>
        <Tabs.Trigger value="history">History</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">
        <p
          style={{ margin: 0, color: "var(--color-text-subtle)", fontSize: "var(--font-size-sm)" }}
        >
          Overview content goes here.
        </p>
      </Tabs.Content>
      <Tabs.Content value="details">
        <p
          style={{ margin: 0, color: "var(--color-text-subtle)", fontSize: "var(--font-size-sm)" }}
        >
          Details content goes here.
        </p>
      </Tabs.Content>
      <Tabs.Content value="history">
        <p
          style={{ margin: 0, color: "var(--color-text-subtle)", fontSize: "var(--font-size-sm)" }}
        >
          History content goes here.
        </p>
      </Tabs.Content>
    </Tabs.Root>
  );
}

export function TabsDisabledDemo() {
  return (
    <Tabs.Root defaultValue="active" style={{ width: "100%" }}>
      <Tabs.List>
        <Tabs.Trigger value="active">Active</Tabs.Trigger>
        <Tabs.Trigger value="archived" disabled>
          Archived
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="active">
        <p
          style={{ margin: 0, color: "var(--color-text-subtle)", fontSize: "var(--font-size-sm)" }}
        >
          Active items.
        </p>
      </Tabs.Content>
      <Tabs.Content value="archived">
        <p
          style={{ margin: 0, color: "var(--color-text-subtle)", fontSize: "var(--font-size-sm)" }}
        >
          Archived items.
        </p>
      </Tabs.Content>
    </Tabs.Root>
  );
}
