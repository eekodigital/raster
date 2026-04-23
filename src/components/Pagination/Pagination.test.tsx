import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination.js";

describe("Pagination (click mode)", () => {
  it("renders nothing when totalPages is 1 and no itemRange", () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a nav with aria-label="Pagination"', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeDefined();
  });

  it('marks the current page with aria-current="page"', () => {
    render(<Pagination page={3} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Page 3" }).getAttribute("aria-current")).toBe(
      "page",
    );
  });

  it("calls onPageChange with next page when Next is clicked", () => {
    const onChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange with previous page when Prev is clicked", () => {
    const onChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("disables Previous on the first page", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(
      (screen.getByRole("button", { name: "Previous page" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("disables Next on the last page", () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);
    expect((screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("calls onPageChange when a page number button is clicked", () => {
    const onChange = vi.fn();
    render(<Pagination page={1} totalPages={5} onPageChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Page 4" }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("renders ellipsis for large page counts", () => {
    const { container } = render(<Pagination page={5} totalPages={20} onPageChange={() => {}} />);
    const ellipses = container.querySelectorAll("[aria-hidden]");
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it("accepts a custom aria-label to disambiguate multiple paginations on one page", () => {
    render(
      <Pagination
        page={1}
        totalPages={5}
        onPageChange={() => {}}
        aria-label="Search results pagination"
      />,
    );
    expect(screen.getByRole("navigation", { name: "Search results pagination" })).toBeDefined();
  });
});

describe("Pagination (anchor mode via getHref)", () => {
  it("renders page numbers as <a href> when getHref is provided", () => {
    render(<Pagination page={2} totalPages={5} getHref={(p) => `/posts?page=${p}`} />);
    const link = screen.getByRole("link", { name: "Page 3" });
    expect(link.getAttribute("href")).toBe("/posts?page=3");
  });

  it("renders Previous/Next as <a href> pointing at adjacent pages", () => {
    render(<Pagination page={3} totalPages={5} getHref={(p) => `/?page=${p}`} />);
    expect(screen.getByRole("link", { name: "Previous page" }).getAttribute("href")).toBe(
      "/?page=2",
    );
    expect(screen.getByRole("link", { name: "Next page" }).getAttribute("href")).toBe("/?page=4");
  });

  it("renders the current page as a <span> with aria-current (not a link)", () => {
    render(<Pagination page={3} totalPages={5} getHref={(p) => `/?page=${p}`} />);
    expect(screen.queryByRole("link", { name: "Page 3" })).toBeNull();
    const current = screen.getByLabelText("Page 3");
    expect(current.tagName).toBe("SPAN");
    expect(current.getAttribute("aria-current")).toBe("page");
  });

  it("renders disabled Previous as <span aria-disabled='true'> on first page", () => {
    render(<Pagination page={1} totalPages={5} getHref={(p) => `/?page=${p}`} />);
    const prev = screen.getByLabelText("Previous page");
    expect(prev.tagName).toBe("SPAN");
    expect(prev.getAttribute("aria-disabled")).toBe("true");
    expect(screen.queryByRole("link", { name: "Previous page" })).toBeNull();
  });

  it("renders disabled Next as <span aria-disabled='true'> on last page", () => {
    render(<Pagination page={5} totalPages={5} getHref={(p) => `/?page=${p}`} />);
    const next = screen.getByLabelText("Next page");
    expect(next.tagName).toBe("SPAN");
    expect(next.getAttribute("aria-disabled")).toBe("true");
  });

  it("passes arbitrary href generators (filter params, trailing slashes, etc.)", () => {
    render(
      <Pagination
        page={1}
        totalPages={3}
        getHref={(p) => `/?type=article&page=${p}`}
      />,
    );
    expect(screen.getByRole("link", { name: "Page 2" }).getAttribute("href")).toBe(
      "/?type=article&page=2",
    );
  });
});

describe("Pagination itemRange label", () => {
  it("renders 'Items X–Y of N' when itemRange is provided", () => {
    render(
      <Pagination
        page={2}
        totalPages={7}
        onPageChange={() => {}}
        itemRange={{ from: 21, to: 40, total: 134 }}
      />,
    );
    expect(screen.getByText(/Items 21.40 of 134/)).toBeDefined();
  });

  it("renders the itemRange alongside the anchor-mode pager", () => {
    render(
      <Pagination
        page={1}
        totalPages={3}
        getHref={(p) => `/?page=${p}`}
        itemRange={{ from: 1, to: 20, total: 45 }}
      />,
    );
    expect(screen.getByText(/Items 1.20 of 45/)).toBeDefined();
    expect(screen.getByRole("link", { name: "Next page" })).toBeDefined();
  });

  it("still renders when totalPages is 1 if itemRange is provided", () => {
    render(
      <Pagination
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        itemRange={{ from: 1, to: 3, total: 3 }}
      />,
    );
    expect(screen.getByText(/Items 1.3 of 3/)).toBeDefined();
    expect(screen.queryByRole("button", { name: "Next page" })).toBeNull();
  });

  it("handles an empty total (0 items) gracefully", () => {
    render(
      <Pagination
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        itemRange={{ from: 0, to: 0, total: 0 }}
      />,
    );
    expect(screen.getByText(/Items 0.0 of 0/)).toBeDefined();
  });
});
