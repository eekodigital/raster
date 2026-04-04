import { useState } from "react";
import { Pagination } from "@eekodigital/raster";

export function PaginationDemo({ totalPages = 10 }: { totalPages?: number }) {
  const [page, setPage] = useState(1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-text-subtle)" }}>
        Page {page} of {totalPages}
      </p>
    </div>
  );
}
