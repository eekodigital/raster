import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "../../test-utils/axe.js";
import { LinearGauge } from "./LinearGauge.js";

describe("LinearGauge", () => {
  it("is a meter named by its visible label", () => {
    render(<LinearGauge value={42} max={100} label="Progress" />);
    const meter = screen.getByRole("meter", { name: "Progress" });
    expect(document.getElementById(meter.getAttribute("aria-labelledby")!)?.textContent).toBe(
      "Progress",
    );
  });

  it("exposes min, max, value and a formatted valuetext", () => {
    render(<LinearGauge value={30} min={10} max={50} label="Load" format={(v) => `${v} kg`} />);
    const meter = screen.getByRole("meter", { name: "Load" });
    expect(meter.getAttribute("aria-valuemin")).toBe("10");
    expect(meter.getAttribute("aria-valuemax")).toBe("50");
    expect(meter.getAttribute("aria-valuenow")).toBe("30");
    expect(meter.getAttribute("aria-valuetext")).toBe("30 kg");
    expect(screen.getByText("30 kg / 50 kg")).toBeTruthy();
  });

  it("fills relative to min and clamps", () => {
    const { container, rerender } = render(
      <LinearGauge value={30} min={10} max={50} label="Load" />,
    );
    const fill = () => container.querySelector<HTMLElement>(".raster-linear-gauge__fill")!;
    expect(fill().style.width).toBe("50%");
    rerender(<LinearGauge value={99} min={10} max={50} label="Load" />);
    expect(fill().style.width).toBe("100%");
    rerender(<LinearGauge value={0} min={10} max={50} label="Load" />);
    expect(fill().style.width).toBe("0%");
    rerender(<LinearGauge value={0} min={10} max={10} label="Load" />);
    expect(fill().style.width).toBe("0%");
  });

  it("uses formatLabel for the visible value", () => {
    render(
      <LinearGauge
        value={3}
        max={4}
        label="Steps"
        height={4}
        formatLabel={(v, max) => `${v} of ${max}`}
      />,
    );
    expect(screen.getByText("3 of 4")).toBeTruthy();
    expect(screen.getByRole("meter").getAttribute("aria-valuetext")).toBe("3");
  });

  it("has no axe violations", async () => {
    const { container } = render(<LinearGauge value={1} max={2} label="G" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
