import { ScrollArea } from "@eekodigital/raster";

const tags = [
  "Control objectives",
  "Risk appetite",
  "Audit universe",
  "Control testing",
  "Remediation tracking",
  "Policy management",
  "Compliance calendar",
  "Evidence collection",
  "Issue management",
  "Board reporting",
  "Regulatory mapping",
  "Third-party risk",
];

export function ScrollAreaBasicDemo() {
  return (
    <ScrollArea.Root
      type="always"
      style={{
        height: "12rem",
        width: "22rem",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <ScrollArea.Viewport style={{ padding: "var(--spacing-4)" }}>
        <div
          style={{
            fontFamily: "var(--font-family-sans)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--spacing-2)",
            color: "var(--color-text-subtle)",
          }}
        >
          Audit workstream tags
        </div>
        {tags.map((tag) => (
          <div
            key={tag}
            style={{
              padding: "var(--spacing-2) 0",
              borderBottom: "1px solid var(--color-border)",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text)",
            }}
          >
            {tag}
          </div>
        ))}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical" />
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}

export function ScrollAreaHorizontalDemo() {
  return (
    <ScrollArea.Root
      type="always"
      style={{
        width: "22rem",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <ScrollArea.Viewport
        style={{ padding: "var(--spacing-4) var(--spacing-4) var(--spacing-6)" }}
      >
        <div
          style={{
            fontFamily: "var(--font-family-sans)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            marginBottom: "var(--spacing-2)",
            color: "var(--color-text-subtle)",
          }}
        >
          Workstream tags
        </div>
        <div style={{ display: "flex", gap: "var(--spacing-3)", width: "max-content" }}>
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                padding: "var(--spacing-2) var(--spacing-3)",
                background: "var(--color-surface-raised)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
                whiteSpace: "nowrap",
                color: "var(--color-text)",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="horizontal" />
    </ScrollArea.Root>
  );
}
