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

export function PaginationItemRangeDemo() {
  const [page, setPage] = useState(2);
  const pageSize = 20;
  const total = 134;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      itemRange={{ from, to, total }}
      aria-label="Library pagination"
    />
  );
}

export function PaginationAnchorDemo({
  page = 2,
  totalPages = 7,
}: {
  page?: number;
  totalPages?: number;
}) {
  const pageSize = 20;
  const total = (totalPages - 1) * pageSize + 14;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      getHref={(p) => `#page-${p}`}
      itemRange={{ from, to, total }}
      aria-label="Feed pagination"
    />
  );
}
