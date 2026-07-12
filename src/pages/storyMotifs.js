// Generates ghosted line-art "signature" motifs for each public story so every
// person's section on Stories2 carries its own hand-drawn-feeling mark instead
// of a repeated template. Paths are plain SVG `d` strings drawn with simple
// trig/parametric math — no external art assets required.

function circlePath(cx, cy, r) {
  return `M ${(cx + r).toFixed(1)},${cy.toFixed(1)} A ${r},${r} 0 1,1 ${(cx - r).toFixed(1)},${cy.toFixed(1)} A ${r},${r} 0 1,1 ${(cx + r).toFixed(1)},${cy.toFixed(1)}`;
}

function sunMotif() {
  const cx = 120, cy = 122, r = 36;
  const paths = [circlePath(cx, cy, r)];
  const rayCount = 10;
  for (let i = 0; i < rayCount; i += 1) {
    const a = (i / rayCount) * Math.PI * 2;
    const r1 = r + 13, r2 = r + 32;
    paths.push(
      `M ${(cx + Math.cos(a) * r1).toFixed(1)},${(cy + Math.sin(a) * r1).toFixed(1)} L ${(cx + Math.cos(a) * r2).toFixed(1)},${(cy + Math.sin(a) * r2).toFixed(1)}`
    );
  }
  return paths;
}

function compassMotif() {
  const cx = 120, cy = 120, rOuter = 56;
  const paths = [circlePath(cx, cy, rOuter)];
  const tickCount = 16;
  for (let i = 0; i < tickCount; i += 1) {
    const a = (i / tickCount) * Math.PI * 2 - Math.PI / 2;
    const long = i % 4 === 0;
    const r1 = rOuter - 3, r2 = rOuter - (long ? 17 : 8);
    paths.push(
      `M ${(cx + Math.cos(a) * r1).toFixed(1)},${(cy + Math.sin(a) * r1).toFixed(1)} L ${(cx + Math.cos(a) * r2).toFixed(1)},${(cy + Math.sin(a) * r2).toFixed(1)}`
    );
  }
  paths.push(`M ${cx},${cy - rOuter + 20} L ${cx + 9},${cy} L ${cx},${cy + rOuter - 20} L ${cx - 9},${cy} Z`);
  return paths;
}

function mountainMotif() {
  return [
    "M 14,196 L 62,108 L 96,148 L 138,54 L 176,132 L 226,196",
    "M 34,196 C 64,164 88,152 108,168 S 158,196 224,150",
    circlePath(168, 76, 15),
  ];
}

function featherMotif() {
  const spine = "M 120,26 C 98,90 100,152 122,214";
  const barbs = [];
  for (let i = 0; i < 8; i += 1) {
    const t = i / 7;
    const y = 40 + t * 160;
    const width = 32 * (1 - Math.abs(t - 0.48) * 1.3);
    const lx = 120 - width, rx = 120 + width;
    barbs.push(`M 120,${y.toFixed(1)} C ${(120 - width * 0.55).toFixed(1)},${(y - 5).toFixed(1)} ${(120 - width * 0.9).toFixed(1)},${(y + 5).toFixed(1)} ${lx.toFixed(1)},${(y + 11).toFixed(1)}`);
    barbs.push(`M 120,${y.toFixed(1)} C ${(120 + width * 0.55).toFixed(1)},${(y - 5).toFixed(1)} ${(120 + width * 0.9).toFixed(1)},${(y + 5).toFixed(1)} ${rx.toFixed(1)},${(y + 11).toFixed(1)}`);
  }
  return [spine, ...barbs];
}

function waveMotif() {
  const paths = [];
  for (let row = 0; row < 4; row += 1) {
    const y = 66 + row * 30;
    paths.push(`M 8,${y} C 48,${y - 22} 88,${y + 22} 128,${y} S 208,${y + 22} 232,${y}`);
  }
  return paths;
}

function rootMotif() {
  const paths = ["M 120,18 L 120,108"];
  function branch(x, y, angleDeg, len, depth) {
    if (depth <= 0) return;
    const rad = (angleDeg * Math.PI) / 180;
    const x2 = x + Math.sin(rad) * len;
    const y2 = y + Math.cos(rad) * len;
    paths.push(`M ${x.toFixed(1)},${y.toFixed(1)} L ${x2.toFixed(1)},${y2.toFixed(1)}`);
    branch(x2, y2, angleDeg - 24, len * 0.72, depth - 1);
    branch(x2, y2, angleDeg + 24, len * 0.72, depth - 1);
  }
  branch(120, 108, 24, 42, 3);
  branch(120, 108, -20, 46, 3);
  branch(120, 108, 68, 34, 2);
  branch(120, 108, -64, 34, 2);
  return paths;
}

function moonMotif() {
  const cy = 120;
  const positions = [36, 80, 124, 168, 212];
  const paths = positions.map((cx) => circlePath(cx, cy, 17));
  paths.push("M 20,168 Q 120,200 220,168");
  return paths;
}

function spiralMotif() {
  const cx = 120, cy = 120, turns = 3.1, steps = 130;
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const angle = t * turns * Math.PI * 2;
    const r = 6 + t * 68;
    points.push(`${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`);
  }
  return [`M ${points.join(" L ")}`];
}

function blossomMotif() {
  const cx = 120, cy = 120, petals = 6, len = 50;
  const paths = [circlePath(cx, cy, 9)];
  for (let i = 0; i < petals; i += 1) {
    const a = (i / petals) * Math.PI * 2;
    const tipx = cx + Math.cos(a) * len, tipy = cy + Math.sin(a) * len;
    const c1x = cx + Math.cos(a - 0.36) * len * 0.72, c1y = cy + Math.sin(a - 0.36) * len * 0.72;
    const c2x = cx + Math.cos(a + 0.36) * len * 0.72, c2y = cy + Math.sin(a + 0.36) * len * 0.72;
    paths.push(
      `M ${cx},${cy} Q ${c1x.toFixed(1)},${c1y.toFixed(1)} ${tipx.toFixed(1)},${tipy.toFixed(1)} Q ${c2x.toFixed(1)},${c2y.toFixed(1)} ${cx},${cy}`
    );
  }
  return paths;
}

function starburstMotif() {
  const stars = [[58, 62], [112, 38], [162, 68], [194, 128], [152, 182], [88, 172], [46, 118], [120, 120]];
  const lines = [[0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]];
  const paths = lines.map(([a, b]) => `M ${stars[a][0]},${stars[a][1]} L ${stars[b][0]},${stars[b][1]}`);
  stars.forEach(([x, y]) => {
    paths.push(`M ${x - 6},${y} L ${x + 6},${y} M ${x},${y - 6} L ${x},${y + 6}`);
  });
  return paths;
}

export const STORY_VISUALS = {
  dee: { accent: "#dc9a49", frame: "circle", rotate: -6, motif: sunMotif() },
  sam: { accent: "#6a93a6", frame: "hex", rotate: 4, motif: compassMotif() },
  michael: { accent: "#7f9463", frame: "arch", rotate: -3, motif: mountainMotif() },
  "banjo-andy": { accent: "#c9924f", frame: "blob", rotate: 5, motif: featherMotif() },
  taylor: { accent: "#4f9d8f", frame: "diamond", rotate: -4, motif: waveMotif() },
  rachel: { accent: "#9c7a4c", frame: "circle", rotate: 3, motif: rootMotif() },
  frank: { accent: "#6f7aa8", frame: "arch", rotate: -5, motif: moonMotif() },
  danielle: { accent: "#a1738f", frame: "hex", rotate: 6, motif: spiralMotif() },
  dana: { accent: "#b8728e", frame: "blob", rotate: -4, motif: blossomMotif() },
  "ms-sunshine": { accent: "#d6a23e", frame: "diamond", rotate: 4, motif: starburstMotif() },
};
