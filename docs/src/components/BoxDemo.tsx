import { Box } from "@eekodigital/raster";

export function BoxPaddingDemo() {
  return (
    <Box
      padding="4"
      style={{ background: "var(--color-surface-raised)", borderRadius: "var(--radius-md)" }}
    >
      <p style={{ margin: 0, fontFamily: "var(--font-family-sans)", color: "var(--color-text)" }}>
        Content with padding "4" (1rem)
      </p>
    </Box>
  );
}

export function BoxPaddingXYDemo() {
  return (
    <Box
      paddingX="6"
      paddingY="3"
      style={{ background: "var(--color-surface-raised)", borderRadius: "var(--radius-md)" }}
    >
      <p style={{ margin: 0, fontFamily: "var(--font-family-sans)", color: "var(--color-text)" }}>
        paddingX="6" paddingY="3"
      </p>
    </Box>
  );
}

export function BoxAsDemo() {
  return (
    <Box
      as="section"
      padding="4"
      style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}
    >
      <p style={{ margin: 0, fontFamily: "var(--font-family-sans)", color: "var(--color-text)" }}>
        Rendered as a &lt;section&gt; element
      </p>
    </Box>
  );
}
