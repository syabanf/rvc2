// Generates the dummy product art for the desktop Merch "lab" canvas:
// garment mock-ups with RVC prints, event posters, stickers. Pure SVG.
// Run: node scripts/gen-lab-art.mjs  → public/assets/img/lab/*.svg + src/data/lab.generated.ts
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "public/assets/img/lab";
mkdirSync(OUT, { recursive: true });

const SANS = "Helvetica Neue, Helvetica, Arial, sans-serif";
const MONO = "Menlo, ui-monospace, monospace";

/* ---------- garments (drawn in a 280×350 box, scaled to the canvas) ---------- */
const TEE = "M70 70l30-18h20c4 10 16 16 20 16s16-6 20-16h20l30 18-14 30-18-8v118H102V92l-18 8z";
const HOODIE = "M68 82l34-24c8-14 22-20 38-20s30 6 38 20l34 24-14 40-18-10v108H100V112l-18 10z";
const LONG = "M100 56h20c4 10 16 16 20 16s16-6 20-16h20l22 16 24 104-22 6-22-90v126H102V92l-22 90-22-6 24-104z";
const TOTE = "M90 110h100l8 140H82z";
const TOTE_HANDLE = '<path d="M112 110c0-40 56-40 56 0" fill="none" stroke="#D8CFBC" stroke-width="7"/>';
// Bounding boxes of each silhouette, so it can be scaled to fill the frame.
const BOX = {
  [TEE]: [56, 52, 168, 158],
  [HOODIE]: [54, 38, 172, 182],
  [LONG]: [58, 56, 164, 166],
  [TOTE]: [82, 76, 116, 174],
};

const garment = (path, color, print, { w, h }) => {
  const [bx, by, bw, bh] = BOX[path];
  const s = Math.min((w * 0.84) / bw, (h * 0.8) / bh);
  const tx = w / 2 - (bx + bw / 2) * s;
  const ty = h / 2 - (by + bh / 2) * s;
  return `<g transform="translate(${tx} ${ty}) scale(${s})">
    ${path === TOTE ? TOTE_HANDLE : ""}
    <path d="${path}" fill="${color}"/>
    <path d="${path}" fill="url(#fold)" opacity=".5"/>
    <g transform="translate(140 ${path === TOTE ? 175 : 140})">${print}</g>
  </g>`;
};

/* ---------- prints (centred on 0,0, ~70px wide in garment units) ---------- */
const arches = (a, b, label) =>
  [0, 1, 2, 3, 4, 5]
    .map((i) => `<path d="M${-34 + i * 4} 34V${-6 + i * 3}a${34 - i * 4} ${34 - i * 4} 0 0 1 ${68 - i * 8} 0V34" fill="none" stroke="${i % 2 ? b : a}" stroke-width="1.6"/>`)
    .join("") +
  `<g fill="${b}">${[-12, 0, 12].map((x) => `<circle cx="${x}" cy="10" r="5"/><circle cx="${x}" cy="10" r="1.8" fill="${a}"/>`).join("")}</g>
   <text y="48" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="7" letter-spacing="1" fill="${b}">${label}</text>`;

const ring = (fg, text) => `
  <defs><path id="rp-${text.length}" d="M0 -30a30 30 0 1 1 -.1 0"/></defs>
  <circle r="36" fill="none" stroke="${fg}" stroke-width=".8"/>
  <text font-family="${SANS}" font-weight="700" font-size="7.2" letter-spacing="1.6" fill="${fg}"><textPath href="#rp-${text.length}">${text}</textPath></text>
  <path d="M-16 0q16-14 32 0q-16 14-32 0z" fill="none" stroke="${fg}" stroke-width="1.4"/><circle r="5" fill="${fg}"/>`;

const globe = (fg) => `
  <circle r="30" fill="none" stroke="${fg}" stroke-width="1.6"/>
  ${[-20, -10, 0, 10, 20].map((y) => `<ellipse cy="${y}" rx="${Math.sqrt(900 - y * y)}" ry="1" fill="none" stroke="${fg}" stroke-width=".8"/>`).join("")}
  ${[8, 18, 26].map((rx) => `<ellipse rx="${rx}" ry="30" fill="none" stroke="${fg}" stroke-width=".8"/>`).join("")}
  <text y="46" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="9" letter-spacing="3" fill="${fg}">VISION</text>`;

const burst = (fg, bg) =>
  Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const r1 = 10, r2 = i % 2 ? 30 : 38;
    return `<line x1="${Math.cos(a) * r1}" y1="${Math.sin(a) * r1}" x2="${Math.cos(a) * r2}" y2="${Math.sin(a) * r2}" stroke="${fg}" stroke-width="1.4"/>`;
  }).join("") + `<circle r="9" fill="${fg}"/><circle r="4" fill="${bg}"/>`;

const type = (fg, lines, size = 22) =>
  lines.map((l, i) => `<text y="${(i - (lines.length - 1) / 2) * size * 0.9 + size * 0.34}" text-anchor="middle" font-family="${SANS}" font-weight="800" font-size="${size}" letter-spacing="-1" fill="${fg}">${l}</text>`).join("");

const halftone = (fg, cols = 12, rows = 8, step = 6) => {
  let d = "";
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const k = 1 - Math.hypot(c - cols / 2, r - rows / 2) / (cols / 1.6);
      if (k > 0) d += `<circle cx="${(c - cols / 2) * step}" cy="${(r - rows / 2) * step}" r="${(step / 2) * k}"/>`;
    }
  return `<g fill="${fg}">${d}</g>`;
};

/* ---------- canvases ---------- */
const svg = (w, h, bg, body, { grain = true } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
  <linearGradient id="fold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>
  <radialGradient id="light" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0"/></filter>
</defs>
<rect width="${w}" height="${h}" fill="${bg}"/>
<rect width="${w}" height="${h}" fill="url(#light)"/>
${body}
${grain ? `<rect width="${w}" height="${h}" filter="url(#grain)"/>` : ""}
</svg>`;

const poster = (w, h, bg, fg, top, big, bottom, extra = "") =>
  svg(
    w,
    h,
    bg,
    `${extra}
    <text x="${w * 0.07}" y="${h * 0.09}" font-family="${MONO}" font-size="${w * 0.028}" letter-spacing="2" fill="${fg}">${top}</text>
    ${big.map((l, i) => `<text x="${w * 0.07}" y="${h * 0.62 + i * w * 0.2}" font-family="${SANS}" font-weight="800" font-size="${w * 0.22}" letter-spacing="${-w * 0.008}" fill="${fg}">${l}</text>`).join("")}
    <text x="${w * 0.07}" y="${h * 0.95}" font-family="${MONO}" font-size="${w * 0.028}" letter-spacing="2" fill="${fg}">${bottom}</text>
    <text x="${w * 0.93}" y="${h * 0.95}" text-anchor="end" font-family="${SANS}" font-weight="700" font-size="${w * 0.03}" fill="${fg}">RVC®</text>`,
  );

const orbit = (w, h, c) =>
  [0.18, 0.28, 0.38].map((r, i) => `<ellipse cx="${w / 2}" cy="${h * 0.36}" rx="${w * r}" ry="${w * r * 0.38}" transform="rotate(${-20 + i * 25} ${w / 2} ${h * 0.36})" fill="none" stroke="${c}" stroke-width="2"/>`).join("") +
  `<circle cx="${w / 2}" cy="${h * 0.36}" r="${w * 0.05}" fill="${c}"/>`;

const items = [];
const add = (file, name, w, h, markup, extra = {}) => {
  writeFileSync(`${OUT}/${file}.svg`, markup);
  items.push({ img: `/assets/img/lab/${file}.svg`, name, w, h, ...extra });
};

const T = { w: 800, h: 1000 };
add("tee-arches", "Arches Tee — Black", 800, 1000, svg(800, 1000, "#2B2A28", garment(TEE, "#141414", arches("#B8432E", "#E9DCC4", "RAW EXPERIENCE"), T)));
add("tee-ring", "Third Eye Tee — Black", 1000, 1000, svg(1000, 1000, "#E9E7E2", garment(TEE, "#1A1A1A", ring("#E9E7E2", "RAW VISION COLLECTIVE • JAKARTA • 2026 •"), { w: 1000, h: 1000 })));
add("poster-ye", "Poster — YE Live GBK", 760, 1000, poster(760, 1000, "#E8461E", "#FFF4EA", "RVC 004 · GELORA BUNG KARNO", ["YE", "LIVE"], "24.10.2026 — JAKARTA", `<circle cx="560" cy="300" r="170" fill="#FF7A3D"/><circle cx="560" cy="300" r="110" fill="#E8461E"/>`));
add("hoodie-gbk", "GBK Hoodie — Charcoal", 800, 1000, svg(800, 1000, "#D9D6CF", garment(HOODIE, "#2E2F31", type("#D86A7A", ["GBK", "24.10"], 20) + `<g stroke="#D86A7A" stroke-width="1.2">${[30, 34, 38, 42, 46].map((y) => `<line x1="-30" x2="30" y1="${y}" y2="${y}"/>`).join("")}</g>`, T), { grain: true }), { raw: true });
add("tee-globe", "Vision Tee — Bone", 800, 1000, svg(800, 1000, "#CFCBC3", garment(TEE, "#F1EEE7", globe("#151515"), T)));
add("poster-jeff", "Poster — Jeff Mills", 700, 1000, poster(700, 1000, "#0C1B3A", "#9FC1FF", "RVC 002 · ZOO SCBD", ["JEFF", "MILLS"], "MAY 2026 — TECHNO", orbit(700, 1000, "#3E7BFF")));
add("poster-moody", "Poster — Moodymann", 760, 1000, poster(760, 1000, "#120806", "#F0B36A", "RVC 003 · ZOO SCBD", ["MOODY", "MANN"], "AUG 2026 — DETROIT", `<rect x="0" y="0" width="760" height="560" fill="#7A1E10"/><circle cx="380" cy="300" r="190" fill="#C2461C"/>`));
add("tee-burst", "Sunburst Tee — Sand", 1000, 1000, svg(1000, 1000, "#F3F1EC", garment(TEE, "#C9B28C", burst("#2A2016", "#C9B28C"), { w: 1000, h: 1000 })));
add("longsleeve-raw", "RAW Longsleeve — Black", 560, 1000, svg(560, 1000, "#1B1B1B", garment(LONG, "#0B0B0B", type("#EDEBE6", ["RAW"], 26), { w: 560, h: 1000 })), { raw: true });
add("cap-rvc", "RVC Cap — Black", 1000, 1000, svg(1000, 1000, "#E4E1DA", `<g transform="translate(500 560) scale(4.2)"><path d="M-54 0c0-40 24-66 54-66s54 26 54 66z" fill="#1C1C1C"/><path d="M-64 0h150c0 10-20 18-60 18h-76c-10 0-14-8-14-18z" fill="#111"/><text y="-28" text-anchor="middle" font-family="${SANS}" font-weight="800" font-size="16" fill="#E9DCC4">RVC</text></g>`));
add("tote-stamp", "Stamp Tote — Natural", 800, 1000, svg(800, 1000, "#BFB8AA", garment(TOTE, "#EDE6D6", `<g transform="translate(0 30)"><rect x="-40" y="-26" width="80" height="52" fill="none" stroke="#1D1D1D" stroke-width="1.6"/>${type("#1D1D1D", ["RAW", "VISION"], 15)}<text y="22" text-anchor="middle" font-family="${MONO}" font-size="5" fill="#1D1D1D">COLLECTIVE · JKT</text></g>`, T)));
add("poster-halftone", "Poster — RAW Halftone", 800, 1000, svg(800, 1000, "#EFEDE7", `<g transform="translate(400 430) scale(9)">${halftone("#121212", 14, 10, 5.5)}</g><text x="56" y="900" font-family="${SANS}" font-weight="800" font-size="190" letter-spacing="-8" fill="#121212">RAW</text><text x="60" y="80" font-family="${MONO}" font-size="20" letter-spacing="3" fill="#121212">RAW VISION COLLECTIVE</text>`));
add("tee-script", "Mystery Tee — Rust", 1000, 1000, svg(1000, 1000, "#EEECE8", garment(TEE, "#8A4E2E", `<text y="-4" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="26" fill="#F1D9B8">Raw</text><text y="20" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="18" fill="#F1D9B8">vision</text><circle cy="-30" r="8" fill="#E7C96A"/>`, { w: 1000, h: 1000 })));
add("poster-archive", "Poster — RVC Archive", 1200, 800, svg(1200, 800, "#111111", `${[0, 1, 2, 3].map((i) => `<rect x="${60 + i * 275}" y="180" width="250" height="440" fill="none" stroke="#3A3A3A" stroke-width="2"/><text x="${80 + i * 275}" y="590" font-family="${MONO}" font-size="20" fill="#C8B89A">RVC 00${4 - i}</text>`).join("")}<text x="60" y="130" font-family="${SANS}" font-weight="800" font-size="88" letter-spacing="-3" fill="#EDEBE6">THE ARCHIVE</text><text x="60" y="720" font-family="${MONO}" font-size="20" letter-spacing="3" fill="#8F8C86">2026 — JAKARTA</text>`));
add("hoodie-globe", "Globe Hoodie — Bone", 800, 1000, svg(800, 1000, "#2A2A2A", garment(HOODIE, "#E6E1D6", globe("#2A2A2A"), T)));
add("stickers", "Sticker Pack", 1000, 1000, svg(1000, 1000, "#F2F0EB", [
  [260, 260, 170, "#E8461E", "RVC"], [700, 300, 150, "#121212", "RAW"], [330, 700, 140, "#3E7BFF", "JKT"], [720, 720, 180, "#C8B89A", "GBK"],
].map(([x, y, r, c, t]) => `<circle cx="${x}" cy="${y}" r="${r + 12}" fill="#fff"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><text x="${x}" y="${y + r * 0.22}" text-anchor="middle" font-family="${SANS}" font-weight="800" font-size="${r * 0.62}" fill="${c === "#C8B89A" ? "#121212" : "#fff"}">${t}</text>`).join("")));
add("poster-wide", "Poster — Raw Vision Collective", 1200, 800, svg(1200, 800, "#D9361E", `<g transform="translate(900 400) scale(16)">${halftone("#FFE9DA", 12, 8, 5)}</g><text x="60" y="300" font-family="${SANS}" font-weight="800" font-size="150" letter-spacing="-6" fill="#FFE9DA">RAW</text><text x="60" y="450" font-family="${SANS}" font-weight="800" font-size="150" letter-spacing="-6" fill="#FFE9DA">VISION</text><text x="60" y="600" font-family="${SANS}" font-weight="800" font-size="150" letter-spacing="-6" fill="#FFE9DA">COLLECTIVE</text>`));
add("poster-listening", "Poster — Listening Party", 760, 1000, poster(760, 1000, "#F2B8C6", "#2A0F18", "RVC 001 · BENGKEL SPACE", ["LISTEN", "ING"], "APR 2026 — YE", `<g transform="translate(380 330)">${[0, 1, 2, 3, 4].map((i) => `<circle r="${60 + i * 34}" fill="none" stroke="#2A0F18" stroke-width="3"/>`).join("")}</g>`));
add("tee-jakarta", "Jakarta Tee — White", 800, 1000, svg(800, 1000, "#8C8C8A", garment(TEE, "#F7F6F2", type("#141414", ["JAKARTA", "2026"], 14) + `<rect x="-36" y="18" width="72" height="3" fill="#E8461E"/>`, T)));
add("card-raw", "RAW Member Card", 1000, 1000, svg(1000, 1000, "#ECE9E2", `<g transform="translate(500 500) rotate(-8)"><rect x="-330" y="-208" width="660" height="416" rx="22" fill="#111" stroke="#C8B89A" stroke-width="3"/><text x="-290" y="-110" font-family="${SANS}" font-weight="800" font-size="110" letter-spacing="-6" fill="#EDEBE6">RAW</text><text x="-290" y="150" font-family="${SANS}" font-weight="700" font-size="34" fill="#EDEBE6">MEMBER</text><text x="-290" y="180" font-family="${MONO}" font-size="18" fill="#8F8C86">NO. 0001 · VALID TO 2027</text><rect x="170" y="70" width="120" height="120" rx="10" fill="#EDEBE6"/></g>`), { raw: true });
add("poster-techno", "Poster — Techno Lines", 560, 1000, svg(560, 1000, "#0A0A0A", `${Array.from({ length: 26 }, (_, i) => `<line x1="0" y1="${120 + i * 26}" x2="560" y2="${120 + i * 26 - 80}" stroke="#3E7BFF" stroke-width="${1 + (i % 4)}"/>`).join("")}<text x="40" y="940" font-family="${SANS}" font-weight="800" font-size="96" letter-spacing="-4" fill="#EDEBE6">TECHNO</text><text x="40" y="70" font-family="${MONO}" font-size="18" letter-spacing="3" fill="#9FC1FF">JEFF MILLS · RVC 002</text>`));
add("tee-ye", "YE Globe Tee — Washed Black", 800, 1000, svg(800, 1000, "#3A3936", garment(TEE, "#232220", globe("#EDEBE6").replace("VISION", "YE · GBK"), T)));

/* Text-free event covers (tall), for the Events cards — not shop items. */
const cover = (file, markup) => writeFileSync(`${OUT}/${file}.svg`, markup);
cover("cover-halftone", svg(800, 1400, "#E9E6DF", `<g transform="translate(400 760) scale(16)">${halftone("#141414", 16, 22, 4.2)}</g>`));
cover("cover-orbit", svg(800, 1400, "#0A1630", `${[0.22, 0.34, 0.46, 0.58].map((r, i) => `<ellipse cx="400" cy="780" rx="${800 * r}" ry="${800 * r * 0.36}" transform="rotate(${-28 + i * 19} 400 780)" fill="none" stroke="#3E7BFF" stroke-width="${3 - i * 0.4}" opacity="${0.95 - i * 0.15}"/>`).join("")}<circle cx="400" cy="780" r="46" fill="#9FC1FF"/>`));
cover("cover-sun", svg(800, 1400, "#1A0705", `<rect y="760" width="800" height="640" fill="#2A0C06"/>${[360, 290, 220, 150].map((r, i) => `<circle cx="400" cy="760" r="${r}" fill="${["#5A1A0C", "#8A2A12", "#C2461C", "#F07A3A"][i]}"/>`).join("")}<rect y="760" width="800" height="640" fill="#120403" opacity=".85"/>`));

const ts = `// Generated by scripts/gen-lab-art.mjs — dummy products for the desktop Merch lab.
export type LabItem = { img: string; name: string; w: number; h: number; raw?: boolean };

export const labItems: LabItem[] = ${JSON.stringify(items, null, 2)};
`;
writeFileSync("src/data/lab.generated.ts", ts);
console.log(`lab art: ${items.length} items → ${OUT}`);
