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
          width={80}
          data={[10, 25, 18, 40, 35, 60, 72, 86]}
          color="var(--demo-good)"
          title="Upward trend"
        />
      </span>
      <span>
        Flat:{" "}
        <Sparkline
          width={80}
          data={[50, 48, 52, 49, 51, 50, 48, 52]}
          color="var(--demo-neutral)"
          title="Flat trend"
        />
      </span>
      <span>
        With fill:{" "}
        <Sparkline
          width={80}
          data={[5, 15, 10, 30, 25, 45]}
          fill
          color="var(--demo-accent)"
          title="Growth with area"
        />
      </span>
    </div>
  );
}
