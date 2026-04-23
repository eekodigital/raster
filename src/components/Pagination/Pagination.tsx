import * as styles from "./Pagination.css.js";

export type ItemRange = {
  from: number;
  to: number;
  total: number;
};

type PaginationBaseProps = {
  page: number;
  totalPages: number;
  itemRange?: ItemRange;
  className?: string;
  "aria-label"?: string;
};

type ClickPaginationProps = PaginationBaseProps & {
  onPageChange: (page: number) => void;
  getHref?: never;
};

type AnchorPaginationProps = PaginationBaseProps & {
  getHref: (page: number) => string;
  onPageChange?: never;
};

export type PaginationProps = ClickPaginationProps | AnchorPaginationProps;

function getPageNumbers(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];

  if (page > 3) pages.push("ellipsis");

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (page < totalPages - 2) pages.push("ellipsis");

  pages.push(totalPages);
  return pages;
}

function cx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function Pagination(props: PaginationProps) {
  const { page, totalPages, itemRange, className, "aria-label": ariaLabel = "Pagination" } = props;

  if (totalPages <= 1 && !itemRange) return null;

  const pageNumbers = getPageNumbers(page, totalPages);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const renderControl = (
    targetPage: number,
    content: string,
    ariaLabelText: string,
    disabled: boolean,
    isCurrent: boolean,
  ) => {
    if ("getHref" in props && typeof props.getHref === "function") {
      if (disabled) {
        return (
          <span
            className={cx(styles.button, styles.buttonDisabled)}
            aria-disabled="true"
            aria-label={ariaLabelText}
          >
            {content}
          </span>
        );
      }
      if (isCurrent) {
        return (
          <span
            className={cx(styles.button, styles.buttonCurrent)}
            aria-current="page"
            aria-label={ariaLabelText}
          >
            {content}
          </span>
        );
      }
      return (
        <a href={props.getHref(targetPage)} className={styles.button} aria-label={ariaLabelText}>
          {content}
        </a>
      );
    }

    const onPageChange = (props as ClickPaginationProps).onPageChange;
    return (
      <button
        className={cx(styles.button, isCurrent ? styles.buttonCurrent : undefined)}
        onClick={() => onPageChange(targetPage)}
        disabled={disabled}
        aria-label={ariaLabelText}
        aria-current={isCurrent ? "page" : undefined}
      >
        {content}
      </button>
    );
  };

  return (
    <nav aria-label={ariaLabel} className={cx(styles.root, className)}>
      {totalPages > 1 && (
        <div className={styles.nav}>
          {renderControl(page - 1, "‹", "Previous page", prevDisabled, false)}

          {pageNumbers.map((p, i) =>
            p === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className={styles.ellipsis} aria-hidden>
                …
              </span>
            ) : (
              <span key={p}>{renderControl(p, String(p), `Page ${p}`, false, p === page)}</span>
            ),
          )}

          {renderControl(page + 1, "›", "Next page", nextDisabled, false)}
        </div>
      )}

      {itemRange && (
        <p className={styles.range} aria-live="polite">
          Items {itemRange.from}–{itemRange.to} of {itemRange.total}
        </p>
      )}
    </nav>
  );
}
