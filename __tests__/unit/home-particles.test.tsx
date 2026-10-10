import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomeParticles from "@/components/landing/HomeParticles";

describe("HomeParticles", () => {
  it("renders a fixed decorative field that is hidden from assistive technology", () => {
    const { container } = render(<HomeParticles />);
    const field = screen.getByTestId("home-particles");

    expect(field).toHaveAttribute("aria-hidden", "true");
    expect(field).toHaveClass("cloudlab-home-particles");
    expect(container.querySelectorAll(".cloudlab-home-particles__dot")).toHaveLength(28);
  });
});
