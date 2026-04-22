import { useState } from "react";
import { Pagination } from "@eekodigital/raster";

export function PaginationDemo({
  totalPages = 10,
  label = "Pagination",
}: {
  totalPages?: number;
  label?: string;
}) {
  const [page, setPage] = useState(1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} aria-label={label} />
      <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-subtle)" }}>
        Page {page} of {totalPages}
      </p>
    </div>
  );
}
