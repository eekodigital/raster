import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sparkline } from "./Sparkline.js";

describe("Sparkline", () => {
  it('renders an SVG with role="img"', () => {
    render(<Sparkline data={[10, 20, 30]} aria-label="Trend" />);
    expect(screen.getByRole("img", { name: "Trend" })).toBeDefined();
  });

  it("renders a polyline", () => {
    const { container } = render(<Sparkline data={[10, 20, 30]} aria-label="Trend" />);
    expect(container.querySelector("polyline")).toBeDefined();
  });

  it("renders area fill when fill is true", () => {
    const { container } = render(<Sparkline data={[10, 20, 30]} fill aria-label="Trend" />);
    expect(container.querySelector("path")).toBeDefined();
  });

  it("returns null for less than 2 data points", () => {
    const { container } = render(<Sparkline data={[10]} aria-label="Trend" />);
    expect(container.firstChild).toBeNull();
  });

  it("applies custom dimensions", () => {
    render(<Sparkline data={[10, 20, 30]} width={120} height={32} aria-label="Trend" />);
    const svg = screen.getByRole("img", { name: "Trend" });
    expect(svg.getAttribute("width")).toBe("120");
    expect(svg.getAttribute("height")).toBe("32");
  });
});
