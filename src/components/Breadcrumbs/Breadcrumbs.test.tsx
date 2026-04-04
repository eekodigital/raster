import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./Breadcrumbs.js";

const items = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Audit Report" },
];

describe("Breadcrumbs", () => {
  it('renders a nav with aria-label="Breadcrumb"', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeDefined();
  });

  it("renders all item labels", () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Projects")).toBeDefined();
    expect(screen.getByText("Audit Report")).toBeDefined();
  });

  it("renders links for non-current items", () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Projects" }).getAttribute("href")).toBe("/projects");
  });

  it("renders the last item without a link", () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.queryByRole("link", { name: "Audit Report" })).toBeNull();
  });

  it('marks the last item with aria-current="page"', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText("Audit Report").getAttribute("aria-current")).toBe("page");
  });

  it("renders a single item as current with no link", () => {
    render(<Breadcrumbs items={[{ label: "Dashboard" }]} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Dashboard").getAttribute("aria-current")).toBe("page");
  });
});
