import { Sparkline } from "@eekodigital/raster";

export function SparklineDemo() {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--spacing-6)",
        alignItems: "center",
        fontFamily: "var(--font-family-sans)",
        fontSize: "var(--font-size-sm)",
        color: "var(--color-text)",
      }}
    >
      <span>
        Trend:{" "}
        <Sparkline
          data={[10, 25, 18, 40, 35, 60, 72, 86]}
          color="var(--color-success)"
          aria-label="Upward trend"
        />
      </span>
      <span>
        Flat:{" "}
        <Sparkline
          data={[50, 48, 52, 49, 51, 50, 48, 52]}
          color="var(--color-inactive)"
          aria-label="Flat trend"
        />
      </span>
      <span>
        With fill:{" "}
        <Sparkline
          data={[5, 15, 10, 30, 25, 45]}
          fill
          color="var(--color-interactive)"
          aria-label="Growth with area"
        />
      </span>
    </div>
  );
}
