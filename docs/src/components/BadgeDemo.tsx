import { Badge, Flex } from "@eekodigital/raster";

export function BadgeVariantsDemo() {
  return (
    <Flex gap="3" align="center" wrap>
      <Badge>12</Badge>
      <Badge variant="primary">New</Badge>
      <Badge variant="success">Passed</Badge>
      <Badge variant="danger">3</Badge>
      <Badge variant="warning">7</Badge>
    </Flex>
  );
}

export function BadgeInContextDemo() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-3)",
        fontFamily: "var(--font-family-sans)",
        fontSize: "var(--font-size-sm)",
        color: "var(--color-text)",
      }}
    >
      {[
        { label: "Open findings", count: "14", variant: "danger" as const },
        { label: "Pending review", count: "7", variant: "warning" as const },
        { label: "Passed controls", count: "98", variant: "success" as const },
        { label: "Not applicable", count: "5", variant: "neutral" as const },
      ].map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "var(--spacing-4)",
            padding: "var(--spacing-3) var(--spacing-4)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span>{item.label}</span>
          <Badge variant={item.variant}>{item.count}</Badge>
        </div>
      ))}
    </div>
  );
}
