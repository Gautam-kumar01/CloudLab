import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SampleProjectDemo from "@/components/landing/SampleProjectDemo";

describe("SampleProjectDemo", () => {
  it("shows the React starter source and labels the preview as illustrative", () => {
    render(<SampleProjectDemo />);

    expect(screen.getByRole("tab", { name: "React + Vite" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: /Hello React \+ Vite/ })).toBeInTheDocument();
    expect(screen.getByText(/does not execute code in your browser/)).toBeInTheDocument();
  });

  it("switches tabs to the actual Node and Python starter files and example output", () => {
    render(<SampleProjectDemo />);

    fireEvent.click(screen.getByRole("tab", { name: "Node.js" }));
    expect(screen.getByRole("tab", { name: "Node.js" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("node index.js")).toBeInTheDocument();
    expect(screen.getAllByText("Hello from Node.js!").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("tab", { name: "Python" }));
    expect(screen.getByRole("tab", { name: "Python" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("python main.py")).toBeInTheDocument();
    expect(screen.getAllByText("Hello from Python!").length).toBeGreaterThan(0);
  });

  it("supports arrow and Home keyboard navigation across demo tabs", () => {
    render(<SampleProjectDemo />);

    const reactTab = screen.getByRole("tab", { name: "React + Vite" });
    fireEvent.keyDown(reactTab, { key: "ArrowRight" });
    const nodeTab = screen.getByRole("tab", { name: "Node.js" });
    expect(nodeTab).toHaveAttribute("aria-selected", "true");
    expect(nodeTab).toHaveFocus();

    fireEvent.keyDown(nodeTab, { key: "Home" });
    expect(reactTab).toHaveAttribute("aria-selected", "true");
    expect(reactTab).toHaveFocus();
  });
});
