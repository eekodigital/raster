import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { Sparkline } from "./Sparkline.js";

const DATA = [5, 3, 1200, 9, 7];

describe("Sparkline", () => {
  it("hides the drawing and gives a text summary instead", () => {
    const { container } = render(<Sparkline data={DATA} title="Weekly views" />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText(/^Weekly views:/).textContent).toBe(
      "Weekly views: Sparkline, 5 points. Values from 3 to 1,200. First 5, last 7.",
    );
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("formats values and localises the summary", () => {
    render(
      <Sparkline
        data={DATA}
        title="Views"
        formatValue={(v) => `${v}!`}
        labels={{ summary: (p) => `${p.points} Werte, zuletzt ${p.last}` }}
      />,
    );
    expect(screen.getByText(/^Views:/).textContent).toBe("Views: 5 Werte, zuletzt 7!");
  });

  it("fills its container's width unless given one", () => {
    const { container, rerender } = render(<Sparkline data={DATA} title="V" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe("100%");
    expect(root.style.height).toBe("24px");
    expect(container.querySelector("svg")?.getAttribute("preserveAspectRatio")).toBe("none");
    rerender(<Sparkline data={DATA} title="V" width={80} height={20} />);
    expect(root.style.width).toBe("80px");
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe("0 0 80 20");
  });

  it("renders an area when fill is set", () => {
    const { container } = render(<Sparkline data={DATA} title="V" fill color="red" />);
    expect(container.querySelector(".raster-sparkline__area")?.getAttribute("fill")).toBe("red");
    expect(container.querySelector("polyline")?.getAttribute("stroke")).toBe("red");
  });

  it("renders nothing for fewer than two values", () => {
    const { container } = render(<Sparkline data={[1]} title="V" />);
    expect(container.innerHTML).toBe("");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Sparkline data={DATA} title="V" className="x" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
