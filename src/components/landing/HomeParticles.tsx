import type { CSSProperties } from "react";

type ParticleStyle = CSSProperties & {
  "--particle-x": string;
  "--particle-y": string;
  "--particle-size": string;
  "--particle-opacity": string;
  "--particle-duration": string;
  "--particle-delay": string;
  "--particle-drift-x": string;
  "--particle-drift-y": string;
};

const PARTICLES: ParticleStyle[] = Array.from({ length: 28 }, (_, index) => {
  const driftX = ((index * 13) % 41) - 20;
  const driftY = -14 - ((index * 17) % 35);

  return {
    "--particle-x": `${(index * 37 + 11) % 100}%`,
    "--particle-y": `${(index * 61 + 7) % 100}%`,
    "--particle-size": `${1 + (index % 3) * 0.45}px`,
    "--particle-opacity": `${0.22 + (index % 4) * 0.04}`,
    "--particle-duration": `${18 + ((index * 7) % 15)}s`,
    "--particle-delay": `-${(index * 1.7) % 22}s`,
    "--particle-drift-x": `${driftX}px`,
    "--particle-drift-y": `${driftY}px`,
  };
});

export default function HomeParticles() {
  return (
    <div className="cloudlab-home-particles" aria-hidden="true" data-testid="home-particles">
      {PARTICLES.map((style, index) => (
        <span className="cloudlab-home-particles__dot" key={index} style={style} />
      ))}
    </div>
  );
}
