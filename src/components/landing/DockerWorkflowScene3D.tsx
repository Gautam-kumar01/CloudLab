"use client";

import type { ComponentType } from "react";
import { Boxes } from "lucide-react";

export interface DockerWorkflowStage {
  id: string;
  step: string;
  name: string;
  shortName: string;
  tag: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

interface DockerWorkflowScene3DProps {
  stages: DockerWorkflowStage[];
  activeStageIdx: number;
  onSelectStage: (index: number) => void;
}

function WorkspaceContainerGlyph() {
  return (
    <svg className="docker-workflow__container-glyph" viewBox="0 0 64 60" aria-hidden="true">
      <path d="M32 4 57 18 32 32 7 18 32 4Z" fill="rgba(204,255,0,.13)" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 18 32 32v25L7 43V18Z" fill="rgba(204,255,0,.08)" stroke="currentColor" strokeWidth="1.5" />
      <path d="M57 18 32 32v25l25-14V18Z" fill="rgba(138,43,226,.19)" stroke="currentColor" strokeWidth="1.5" />
      <path d="m18 24 14 8 14-8M18 31l14 8 14-8M18 38l14 8 14-8" fill="none" stroke="currentColor" strokeOpacity=".72" strokeWidth="1.2" />
    </svg>
  );
}

export default function DockerWorkflowScene3D({
  stages,
  activeStageIdx,
  onSelectStage,
}: DockerWorkflowScene3DProps) {
  return (
    <div className="docker-workflow">
      <div className="docker-workflow__topline">
        <span className="docker-workflow__eyebrow"><i /> REQUEST PATH</span>
        <span className="docker-workflow__topline-note">Browser to live preview</span>
      </div>

      <div
        className="docker-workflow__scene"
        role="group"
        aria-label="Interactive isometric Docker workflow"
      >
        <svg
          className="docker-workflow__route"
          viewBox="0 0 1000 360"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="docker-workflow-route-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ccff00" stopOpacity=".18" />
              <stop offset="54%" stopColor="#ccff00" stopOpacity=".72" />
              <stop offset="100%" stopColor="#8a2be2" stopOpacity=".6" />
            </linearGradient>
            <marker
              id="docker-workflow-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0 0 6 3 0 6Z" fill="#ccff00" />
            </marker>
          </defs>
          <path
            className="docker-workflow__route-line"
            d="M165 82 H500 H835 V260 H500 H165"
            markerEnd="url(#docker-workflow-arrow)"
          />
          <circle className="docker-workflow__route-packet" r="5" aria-hidden="true">
            <animateMotion
              dur="8s"
              repeatCount="indefinite"
              path="M165 82 H500 H835 V260 H500 H165"
            />
          </circle>
        </svg>

        <div className="docker-workflow__host-zone" aria-hidden="true" />
        <div className="docker-workflow__host-label" aria-hidden="true">
          <Boxes size={12} /> DOCKER ENGINE HOST · cloudlab-net
        </div>

        <div className="docker-workflow__nodes">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isActive = index === activeStageIdx;
            const isContainer = stage.id === "project-container";

            return (
              <button
                key={stage.id}
                type="button"
                className={`docker-workflow__node docker-workflow__node--${stage.id}`}
                aria-label={`Select stage ${stage.step}: ${stage.name}`}
                aria-pressed={isActive}
                data-active={isActive ? "true" : "false"}
                onClick={() => onSelectStage(index)}
              >
                <span className="docker-workflow__node-heading">
                  <span className="docker-workflow__node-step">{stage.step}</span>
                  <span className={`docker-workflow__node-icon${isContainer ? " is-container" : ""}`}>
                    {isContainer ? <WorkspaceContainerGlyph /> : <Icon size={16} />}
                  </span>
                </span>
                <span className="docker-workflow__node-title">{stage.shortName}</span>
                <span className="docker-workflow__node-tag">{stage.tag}</span>
                {isContainer && <span className="docker-workflow__container-stamp">1 GB · 1 vCPU</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="docker-workflow__legend">
        <span>Click a stage to inspect the implementation.</span>
        <span>Linux container · shared host kernel (not a microVM)</span>
      </div>
    </div>
  );
}
