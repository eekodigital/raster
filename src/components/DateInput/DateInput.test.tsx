import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateInput } from "./DateInput.js";

describe("DateInput", () => {
  it("renders three inputs: Day, Month, Year", () => {
    render(<DateInput label="Date of birth" />);
    expect(screen.getByLabelText("Day")).toBeDefined();
    expect(screen.getByLabelText("Month")).toBeDefined();
    expect(screen.getByLabelText("Year")).toBeDefined();
  });

  it("renders the field label", () => {
    render(<DateInput label="Date of birth" />);
    expect(screen.getByText("Date of birth")).toBeDefined();
  });

  it("renders hint text when provided", () => {
    render(<DateInput label="Date" hint="For example, 27 3 2025" />);
    expect(screen.getByText("For example, 27 3 2025")).toBeDefined();
  });

  it("renders error text when provided", () => {
    render(<DateInput label="Date" error="Enter a valid date" />);
    expect(screen.getByText("Enter a valid date")).toBeDefined();
  });

  it("sets defaultValue on each input", () => {
    render(<DateInput label="Date" defaultValue={{ day: "27", month: "03", year: "2025" }} />);
    expect((screen.getByLabelText("Day") as HTMLInputElement).value).toBe("27");
    expect((screen.getByLabelText("Month") as HTMLInputElement).value).toBe("03");
    expect((screen.getByLabelText("Year") as HTMLInputElement).value).toBe("2025");
  });

  it("calls onChange when a field value changes", () => {
    const onChange = vi.fn();
    render(<DateInput label="Date" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Year"), { target: { value: "2025" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("disables all inputs when disabled prop is set", () => {
    render(<DateInput label="Date" disabled />);
    expect((screen.getByLabelText("Day") as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByLabelText("Month") as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByLabelText("Year") as HTMLInputElement).disabled).toBe(true);
  });

  it("marks inputs as aria-invalid when there is an error", () => {
    render(<DateInput label="Date" error="Invalid" />);
    expect(screen.getByLabelText("Day").getAttribute("aria-invalid")).toBe("true");
  });

  it("auto-advances focus from Day to Month after 2 digits", () => {
    const onChange = vi.fn();
    render(<DateInput label="Date" onChange={onChange} />);
    const day = screen.getByLabelText("Day") as HTMLInputElement;
    const month = screen.getByLabelText("Month") as HTMLInputElement;
    day.focus();
    fireEvent.change(day, { target: { value: "27" } });
    expect(document.activeElement).toBe(month);
  });

  it("auto-advances focus from Month to Year after 2 digits", () => {
    const onChange = vi.fn();
    render(<DateInput label="Date" onChange={onChange} />);
    const month = screen.getByLabelText("Month") as HTMLInputElement;
    const year = screen.getByLabelText("Year") as HTMLInputElement;
    month.focus();
    fireEvent.change(month, { target: { value: "03" } });
    expect(document.activeElement).toBe(year);
  });

  it("does not auto-advance from Day when value is less than 2 digits", () => {
    const onChange = vi.fn();
    render(<DateInput label="Date" onChange={onChange} />);
    const day = screen.getByLabelText("Day") as HTMLInputElement;
    day.focus();
    fireEvent.change(day, { target: { value: "2" } });
    expect(document.activeElement).toBe(day);
  });

  it("sets name attributes on inputs when name is provided", () => {
    render(<DateInput label="Date" name="dob" />);
    expect((screen.getByLabelText("Day") as HTMLInputElement).name).toBe("dob-day");
    expect((screen.getByLabelText("Month") as HTMLInputElement).name).toBe("dob-month");
    expect((screen.getByLabelText("Year") as HTMLInputElement).name).toBe("dob-year");
  });
});
