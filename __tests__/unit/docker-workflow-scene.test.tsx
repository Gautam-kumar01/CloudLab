import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Boxes, Code2 } from "lucide-react";
import DockerWorkflowScene3D, {
  type DockerWorkflowStage,
} from "@/components/landing/DockerWorkflowScene3D";

const stages: DockerWorkflowStage[] = [
  {
    id: "browser-ide",
    step: "01",
    name: "Browser / CloudLab IDE",
    shortName: "Browser IDE",
    tag: "Client Workspace",
    icon: Code2,
  },
  {
    id: "project-container",
    step: "05",
    name: "Project Workspace Container",
    shortName: "Project Container",
    tag: "Container Sandbox",
    icon: Boxes,
  },
];

describe("DockerWorkflowScene3D", () => {
  it("renders an isometric Docker boundary and lets the user select a stage", () => {
    const onSelectStage = vi.fn();
    render(
      <DockerWorkflowScene3D
        stages={stages}
        activeStageIdx={0}
        onSelectStage={onSelectStage}
      />,
    );

    expect(screen.getByRole("group", { name: "Interactive isometric Docker workflow" })).toBeInTheDocument();
    expect(screen.getByText("DOCKER ENGINE HOST · cloudlab-net")).toBeInTheDocument();
    expect(screen.getByText("Linux container · shared host kernel (not a microVM)")).toBeInTheDocument();

    const containerStage = screen.getByRole("button", {
      name: "Select stage 05: Project Workspace Container",
    });
    expect(containerStage).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(containerStage);
    expect(onSelectStage).toHaveBeenCalledWith(1);
  });
});
