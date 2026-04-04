import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Radio, RadioGroup } from "./Radio.js";

describe("RadioGroup", () => {
  describe("mouse interaction", () => {
    it("selects an option on click", () => {
      const onChange = vi.fn();
      render(
        <RadioGroup legend="Format" name="format" onValueChange={onChange}>
          <Radio label="PDF" value="pdf" />
          <Radio label="CSV" value="csv" />
        </RadioGroup>,
      );
      fireEvent.click(screen.getByLabelText("CSV"));
      expect(onChange).toHaveBeenCalledWith("csv");
    });

    it("shows the default selected value", () => {
      render(
        <RadioGroup legend="Format" name="format" defaultValue="csv">
          <Radio label="PDF" value="pdf" />
          <Radio label="CSV" value="csv" />
        </RadioGroup>,
      );
      expect(screen.getByLabelText("CSV").getAttribute("aria-checked")).toBe("true");
      expect(screen.getByLabelText("PDF").getAttribute("aria-checked")).toBe("false");
    });

    it("disabled radio cannot be selected", () => {
      const onChange = vi.fn();
      render(
        <RadioGroup legend="Format" name="format" onValueChange={onChange}>
          <Radio label="PDF" value="pdf" disabled />
        </RadioGroup>,
      );
      fireEvent.click(screen.getByLabelText("PDF"));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("keyboard interaction", () => {
    it("radio items are focusable", () => {
      render(
        <RadioGroup legend="Format" name="format" defaultValue="pdf">
          <Radio label="PDF" value="pdf" />
          <Radio label="CSV" value="csv" />
        </RadioGroup>,
      );
      screen.getByLabelText("PDF").focus();
      expect(document.activeElement).toBe(screen.getByLabelText("PDF"));
    });

    it.each(["ArrowDown", "ArrowRight"])("%s selects next radio", (key) => {
      const onChange = vi.fn();
      render(
        <RadioGroup legend="Format" name="format" defaultValue="pdf" onValueChange={onChange}>
          <Radio label="PDF" value="pdf" />
          <Radio label="CSV" value="csv" />
          <Radio label="XML" value="xml" />
        </RadioGroup>,
      );
      const pdf = screen.getByLabelText("PDF");
      pdf.focus();
      fireEvent.keyDown(pdf, { key });
      expect(onChange).toHaveBeenCalledWith("csv");
    });

    it.each(["ArrowUp", "ArrowLeft"])("%s selects previous radio", (key) => {
      const onChange = vi.fn();
      render(
        <RadioGroup legend="Format" name="format" defaultValue="csv" onValueChange={onChange}>
          <Radio label="PDF" value="pdf" />
          <Radio label="CSV" value="csv" />
          <Radio label="XML" value="xml" />
        </RadioGroup>,
      );
      const csv = screen.getByLabelText("CSV");
      csv.focus();
      fireEvent.keyDown(csv, { key });
      expect(onChange).toHaveBeenCalledWith("pdf");
    });

    it.each([
      ["ArrowDown", "XML", "xml", "pdf"],
      ["ArrowUp", "PDF", "pdf", "xml"],
    ])("%s wraps around from %s", (key, label, _defaultValue, expected) => {
      const onChange = vi.fn();
      render(
        <RadioGroup
          legend="Format"
          name="format"
          defaultValue={_defaultValue}
          onValueChange={onChange}
        >
          <Radio label="PDF" value="pdf" />
          <Radio label="CSV" value="csv" />
          <Radio label="XML" value="xml" />
        </RadioGroup>,
      );
      const el = screen.getByLabelText(label);
      el.focus();
      fireEvent.keyDown(el, { key });
      expect(onChange).toHaveBeenCalledWith(expected);
    });

    it("skips disabled radios when navigating with ArrowDown", () => {
      const onChange = vi.fn();
      render(
        <RadioGroup legend="Format" name="format" defaultValue="pdf" onValueChange={onChange}>
          <Radio label="PDF" value="pdf" />
          <Radio label="CSV" value="csv" disabled />
          <Radio label="XML" value="xml" />
        </RadioGroup>,
      );
      const pdf = screen.getByLabelText("PDF");
      pdf.focus();
      fireEvent.keyDown(pdf, { key: "ArrowDown" });
      expect(onChange).toHaveBeenCalledWith("xml");
    });

    it("skips disabled radios when navigating with ArrowUp", () => {
      const onChange = vi.fn();
      render(
        <RadioGroup legend="Format" name="format" defaultValue="xml" onValueChange={onChange}>
          <Radio label="PDF" value="pdf" />
          <Radio label="CSV" value="csv" disabled />
          <Radio label="XML" value="xml" />
        </RadioGroup>,
      );
      const xml = screen.getByLabelText("XML");
      xml.focus();
      fireEvent.keyDown(xml, { key: "ArrowUp" });
      expect(onChange).toHaveBeenCalledWith("pdf");
    });
  });

  describe("accessibility", () => {
    it("has a labelled radiogroup", () => {
      render(
        <RadioGroup legend="Format" name="format">
          <Radio label="PDF" value="pdf" />
        </RadioGroup>,
      );
      expect(screen.getByRole("radiogroup", { name: "Format" })).toBeDefined();
    });

    it("shows hint text", () => {
      render(
        <RadioGroup legend="Format" name="format" hint="Pick one">
          <Radio label="PDF" value="pdf" />
        </RadioGroup>,
      );
      expect(screen.getByText("Pick one")).toBeDefined();
    });

    it("shows error message", () => {
      render(
        <RadioGroup legend="Format" name="format" error="Required">
          <Radio label="PDF" value="pdf" />
        </RadioGroup>,
      );
      expect(screen.getByText("Required")).toBeDefined();
    });
  });
});
