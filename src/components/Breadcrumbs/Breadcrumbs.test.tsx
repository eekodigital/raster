import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
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

  it("uses renderLink for non-current items when provided", () => {
    function CustomLink({
      href,
      className,
      children,
    }: {
      href: string;
      className: string;
      children: ReactNode;
    }) {
      return (
        <a href={href} className={className} data-custom="true">
          {children}
        </a>
      );
    }
    render(<Breadcrumbs items={items} renderLink={CustomLink} />);
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink.getAttribute("data-custom")).toBe("true");
    expect(homeLink.getAttribute("href")).toBe("/");
    const projectsLink = screen.getByRole("link", { name: "Projects" });
    expect(projectsLink.getAttribute("data-custom")).toBe("true");
  });

  it("does not use renderLink for the current (last) item", () => {
    function CustomLink({
      href,
      className,
      children,
    }: {
      href: string;
      className: string;
      children: ReactNode;
    }) {
      return (
        <a href={href} className={className} data-custom="true">
          {children}
        </a>
      );
    }
    render(<Breadcrumbs items={items} renderLink={CustomLink} />);
    // "Audit Report" is the current item — should be a <span>, not a link
    expect(screen.queryByRole("link", { name: "Audit Report" })).toBeNull();
    expect(screen.getByText("Audit Report").getAttribute("aria-current")).toBe("page");
  });

  it("does not use renderLink for items without an href", () => {
    function CustomLink({
      href,
      className,
      children,
    }: {
      href: string;
      className: string;
      children: ReactNode;
    }) {
      return (
        <a href={href} className={className} data-custom="true">
          {children}
        </a>
      );
    }
    const mixed = [
      { label: "Home", href: "/" },
      { label: "Section (no href)" },
      { label: "Current" },
    ];
    render(<Breadcrumbs items={mixed} renderLink={CustomLink} />);
    // Only "Home" should render as a link
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(1);
    expect(links[0]?.textContent).toBe("Home");
    // Section without href should render as a span, not an <a>
    expect(screen.queryByRole("link", { name: "Section (no href)" })).toBeNull();
  });
});
