import { Skeleton } from "@eekodigital/raster";

export function SkeletonTextDemo() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", width: "20rem" }}
    >
      <Skeleton variant="heading" width="60%" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="75%" />
    </div>
  );
}

export function SkeletonCardDemo() {
  return (
    <div
      style={{ display: "flex", gap: "var(--spacing-4)", alignItems: "flex-start", width: "22rem" }}
    >
      <Skeleton variant="circular" width="3rem" height="3rem" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
        <Skeleton variant="text" width="50%" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
  );
}

export function SkeletonVariantsDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-subtle)",
            width: "7rem",
          }}
        >
          text
        </span>
        <Skeleton variant="text" width="12rem" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-subtle)",
            width: "7rem",
          }}
        >
          heading
        </span>
        <Skeleton variant="heading" width="12rem" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-subtle)",
            width: "7rem",
          }}
        >
          circular
        </span>
        <Skeleton variant="circular" width="3rem" height="3rem" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-subtle)",
            width: "7rem",
          }}
        >
          rectangular
        </span>
        <Skeleton variant="rectangular" width="12rem" height="4rem" />
      </div>
    </div>
  );
}
