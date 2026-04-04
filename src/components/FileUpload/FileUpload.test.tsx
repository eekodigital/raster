import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FileInput, FileUploadField } from "./FileUpload.js";

describe("FileInput", () => {
  it("renders a file input", () => {
    const { container } = render(<FileInput />);
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeDefined();
  });

  it("passes through accept attribute", () => {
    const { container } = render(<FileInput accept=".pdf,.doc" />);
    expect(container.querySelector("input")?.getAttribute("accept")).toBe(".pdf,.doc");
  });

  it("passes through multiple attribute", () => {
    const { container } = render(<FileInput multiple />);
    expect((container.querySelector("input") as HTMLInputElement).multiple).toBe(true);
  });

  it("sets data-error when hasError is true", () => {
    const { container } = render(<FileInput hasError />);
    expect(container.querySelector("input")?.getAttribute("data-error")).toBe("true");
  });
});

describe("FileUploadField", () => {
  it("renders a label", () => {
    render(<FileUploadField label="Upload document" />);
    expect(screen.getByText("Upload document")).toBeDefined();
  });

  it("associates label with the file input", () => {
    render(<FileUploadField label="Upload document" id="upload" />);
    const label = screen.getByText("Upload document") as HTMLLabelElement;
    expect(label.htmlFor).toBe("upload");
  });

  it("renders hint text", () => {
    render(<FileUploadField label="Upload" hint="PDF only, max 5MB" />);
    expect(screen.getByText("PDF only, max 5MB")).toBeDefined();
  });

  it("renders error text", () => {
    render(<FileUploadField label="Upload" error="File must be a PDF" />);
    expect(screen.getByText("File must be a PDF")).toBeDefined();
  });

  it("marks input as aria-invalid when there is an error", () => {
    const { container } = render(<FileUploadField label="Upload" error="Required" />);
    expect(container.querySelector("input")?.getAttribute("aria-invalid")).toBe("true");
  });
});
