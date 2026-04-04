import { Grid } from "@eekodigital/raster";

const cellStyle = {
  padding: "var(--spacing-4)",
  background: "var(--color-surface-raised)",
  borderRadius: "var(--radius-md)",
  fontFamily: "var(--font-family-sans)",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-text)",
  height: "100%",
  boxSizing: "border-box" as const,
};

export function GridProportionalDemo() {
  return (
    <Grid gap="4">
      <Grid.Col width="2fr">
        <div style={cellStyle}>2fr — Main content</div>
      </Grid.Col>
      <Grid.Col width="1fr">
        <div style={cellStyle}>1fr — Sidebar</div>
      </Grid.Col>
    </Grid>
  );
}

export function GridEqualDemo() {
  return (
    <Grid gap="4">
      <Grid.Col width="1fr">
        <div style={cellStyle}>1fr</div>
      </Grid.Col>
      <Grid.Col width="1fr">
        <div style={cellStyle}>1fr</div>
      </Grid.Col>
      <Grid.Col width="1fr">
        <div style={cellStyle}>1fr</div>
      </Grid.Col>
    </Grid>
  );
}

export function GridFixedDemo() {
  return (
    <Grid gap="4">
      <Grid.Col width="200px">
        <div style={cellStyle}>200px fixed</div>
      </Grid.Col>
      <Grid.Col width="auto">
        <div style={cellStyle}>auto — fills remaining</div>
      </Grid.Col>
    </Grid>
  );
}

export function GridResponsiveDemo() {
  return (
    <Grid gap="4">
      <Grid.Col width={{ base: "full", md: "2fr" }}>
        <div style={cellStyle}>Main — full on mobile, 2fr on md+</div>
      </Grid.Col>
      <Grid.Col width={{ base: "full", md: "1fr" }}>
        <div style={cellStyle}>Sidebar — full on mobile, 1fr on md+</div>
      </Grid.Col>
    </Grid>
  );
}
