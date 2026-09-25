import { Sparkline } from "@eekodigital/raster";

export function SparklineDemo() {
  return (
    <div
      style={{
        display: "flex",
        gap: "1.5rem",
        alignItems: "center",
        fontFamily: "inherit",
        fontSize: "0.875rem",
        color: "inherit",
      }}
    >
      <span>
        Trend:{" "}
        <Sparkline
          data={[10, 25, 18, 40, 35, 60, 72, 86]}
          color="var(--demo-good)"
          aria-label="Upward trend"
        />
      </span>
      <span>
        Flat:{" "}
        <Sparkline
          data={[50, 48, 52, 49, 51, 50, 48, 52]}
          color="var(--demo-neutral)"
          aria-label="Flat trend"
        />
      </span>
      <span>
        With fill:{" "}
        <Sparkline
          data={[5, 15, 10, 30, 25, 45]}
          fill
          color="var(--demo-accent)"
          aria-label="Growth with area"
        />
      </span>
    </div>
  );
}
