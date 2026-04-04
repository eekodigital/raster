import { Heading, Text } from "@eekodigital/raster";

export function HeadingScaleDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
      <Heading level="1">Heading 1 — Page title</Heading>
      <Heading level="2">Heading 2 — Section title</Heading>
      <Heading level="3">Heading 3 — Subsection</Heading>
      <Heading level="4">Heading 4 — Card title</Heading>
      <Heading level="5">Heading 5 — Label group</Heading>
      <Heading level="6">Heading 6 — Micro label</Heading>
    </div>
  );
}

export function TextScaleDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
      <Text size="lg">Large (1.125rem / 18px) — introductory paragraphs and lead copy.</Text>
      <Text size="base">Base (1rem / 16px) — body copy, descriptions, and general UI text.</Text>
      <Text size="sm">Small (0.875rem / 14px) — captions, helper text, and metadata.</Text>
    </div>
  );
}

export function HeadingAsDemo() {
  return (
    <div style={{ padding: "1rem" }}>
      <Heading level="3" as="h2">
        Section title
      </Heading>
    </div>
  );
}

export function TextVariantsDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
      <Text variant="default">Default — primary text colour.</Text>
      <Text variant="subtle">Subtle — de-emphasised text for secondary information.</Text>
      <Text variant="strong">Strong — semibold weight for emphasis without heading hierarchy.</Text>
      <Text variant="danger">Danger — used for errors or critical notices.</Text>
    </div>
  );
}
