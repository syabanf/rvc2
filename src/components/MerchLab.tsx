"use client";

import { useEffect, useRef, useState } from "react";
import { defaultSize, isApparel, sizes, type Product } from "@/data/content";
import { labItems, type LabItem } from "@/data/lab.generated";
import { useMember } from "@/lib/member";
import { CheckoutSheet } from "./Checkout";
import { Sheet } from "./Sheet";
import { useToast } from "./toast";

/* Merch (phone and desktop): one endless plane of products you drag, scroll or arrow-key
   in any direction. The tile block is laid out once (justified rows) and
   repeated in a grid, so the plane loops seamlessly both ways. */

const ROW_H = 390;
const GAP = 14;
const ROWS = 4;
const BLOCK_W = 2700;
const DRAG_SLOP = 6; // px of movement before a press counts as a drag
const FRICTION = 0.92;

type Tile = { item: LabItem; i: number; x: number; y: number; w: number; h: number; rot: number };

// Small deterministic pseudo-random, so the layout is identical on every load.
const rand = (n: number) => {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

function layout(): { tiles: Tile[]; bw: number; bh: number } {
  const tiles: Tile[] = [];
  let k = 0;
  for (let r = 0; r < ROWS; r++) {
    const row: { item: LabItem; i: number; w: number }[] = [];
    let width = 0;
    while (width < BLOCK_W) {
      const i = (k + r * 5) % labItems.length;
      const item = labItems[i];
      const w = ROW_H * (item.w / item.h) * (0.9 + rand(k) * 0.15);
      row.push({ item, i, w });
      width += w + GAP;
      k++;
    }
    // Justify the row to exactly BLOCK_W so blocks tile edge to edge.
    const scale = (BLOCK_W - GAP * row.length) / (width - GAP * row.length);
    let x = 0;
    for (const t of row) {
      const w = t.w * scale;
      const h = ROW_H * (0.94 + rand(k + t.i) * 0.06);
      tiles.push({ item: t.item, i: t.i, x, y: r * (ROW_H + GAP) + (ROW_H - h) / 2, w, h, rot: (rand(x + r) - 0.5) * 2.4 });
      x += w + GAP;
    }
  }
  return { tiles, bw: BLOCK_W, bh: ROWS * (ROW_H + GAP) };
}

const LAYOUT = layout();


export function MerchLab() {
  const { tiles, bw, bh } = LAYOUT;
  const viewRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState({ cols: 2, rows: 2 });
  const [open, setOpen] = useState<LabItem | null>(null);
  const [checkout, setCheckout] = useState<Product | null>(null);
  const [size, setSize] = useState(defaultSize);
  const member = useMember();
  const toast = useToast();

  // Motion state lives in refs: the plane moves every frame without re-rendering.
  const pos = useRef({ x: -bw * 0.2, y: -bh * 0.15 });
  const vel = useRef({ x: 0, y: 0 });
  const drag = useRef<{ id: number; sx: number; sy: number; lx: number; ly: number; lt: number; moved: boolean } | null>(null);

  useEffect(() => {
    const view = viewRef.current;
    const plane = planeRef.current;
    if (!view || !plane) return;

    // Phones get the same plane at a smaller scale so several pieces fit on screen.
    let scale = 1;
    const fit = () => {
      scale = view.clientWidth < 700 ? 0.5 : 1;
      setCopies({ cols: Math.ceil(view.clientWidth / (bw * scale)) + 1, rows: Math.ceil(view.clientHeight / (bh * scale)) + 1 });
    };
    fit();
    window.addEventListener("resize", fit);

    const wrap = (v: number, m: number) => ((v % m) + m) % m;
    let raf = 0;
    const frame = () => {
      if (!drag.current) {
        pos.current.x += vel.current.x;
        pos.current.y += vel.current.y;
        vel.current.x *= FRICTION;
        vel.current.y *= FRICTION;
      }
      const w = bw * scale;
      const h = bh * scale;
      plane.style.transform = `translate3d(${wrap(pos.current.x, w) - w}px, ${wrap(pos.current.y, h) - h}px, 0) scale(${scale})`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Wheel / trackpad scrolls the plane (both axes).
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      pos.current.x -= e.deltaX + (e.shiftKey ? e.deltaY : 0);
      if (!e.shiftKey) pos.current.y -= e.deltaY;
    };
    view.addEventListener("wheel", onWheel, { passive: false });

    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector("dialog[open]")) return;
      const push = { ArrowLeft: [24, 0], ArrowRight: [-24, 0], ArrowUp: [0, 24], ArrowDown: [0, -24] }[e.key];
      if (!push) return;
      e.preventDefault();
      vel.current.x += push[0];
      vel.current.y += push[1];
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      view.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [bw, bh]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    vel.current = { x: 0, y: 0 };
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, lt: performance.now(), moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > DRAG_SLOP) {
      d.moved = true;
      viewRef.current?.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    const now = performance.now();
    const dx = e.clientX - d.lx;
    const dy = e.clientY - d.ly;
    const dt = Math.max(1, now - d.lt);
    pos.current.x += dx;
    pos.current.y += dy;
    vel.current = { x: (dx / dt) * 16, y: (dy / dt) * 16 }; // px per frame for the fling
    d.lx = e.clientX;
    d.ly = e.clientY;
    d.lt = now;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved) return;
    // A press without movement is a click on whatever tile is under it.
    const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-lab-i]");
    if (tile) setOpen(labItems[Number(tile.dataset.labI)]);
  };

  const addToBag = () => {
    if (!open) return;
    if (open.raw && !member) {
      toast("Member-only piece — join RAW to buy it.");
      return;
    }
    setCheckout({ name: open.name, price: "[IDR PRICE]", img: open.img, raw: open.raw });
    setOpen(null);
  };

  // Plane copies are laid out in unscaled units; the plane's scale() shrinks them on phones.
  const grid = [];
  for (let cy = 0; cy < copies.rows + 1; cy++)
    for (let cx = 0; cx < copies.cols + 1; cx++) grid.push([cx, cy]);

  return (
    <div className="lab">
      <div
        ref={viewRef}
        className="lab__view"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      >
        <div ref={planeRef} className="lab__plane">
          {grid.map(([cx, cy]) => {
            const first = cx === 1 && cy === 1; // the copy that starts in view gets focusable tiles
            return (
              <div key={`${cx}-${cy}`} className="lab__block" style={{ left: cx * bw, top: cy * bh }} aria-hidden={first ? undefined : true}>
                {tiles.map((t, n) => (
                  <button
                    key={n}
                    type="button"
                    className="lab__tile"
                    data-lab-i={t.i}
                    tabIndex={first ? 0 : -1}
                    style={{ left: t.x, top: t.y, width: t.w, height: t.h, transform: `rotate(${t.rot}deg)` }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpen(t.item);
                      }
                    }}
                    aria-label={`${t.item.name}${t.item.raw ? " — RAW members" : ""}`}
                  >
                    <img src={t.item.img} alt="" draggable={false} loading="lazy" />
                    {t.item.raw && <span className="lab__badge">RAW</span>}
                    <span className="lab__cap">
                      <span>{t.item.name}</span>
                      <span>[IDR PRICE]</span>
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="lab__info">
        <span className="eyebrow">RVC Merch Lab</span>
        <p>
          {labItems.length} pieces from Drop 01 — tees, hoodies, posters and goods, laid out on one plane. Drag anywhere,
          scroll, or use the arrow keys. Tap a piece to buy it.
        </p>
      </div>
      <span className="lab__hint" aria-hidden="true">
        (DRAG ANYWHERE)
      </span>

      <Sheet open={open !== null} onClose={() => setOpen(null)} title={open?.name ?? ""}>
        {open && (
          <div className="lab-product">
            <div className="lab-product__media">
              <img src={open.img} alt={open.name} />
            </div>
            <div className="product-line">
              <span className="product-line__name">{open.raw ? "RAW members only" : "Drop 01 · limited"}</span>
              <span className="product-line__price">[IDR PRICE]</span>
            </div>
            {isApparel(open.name) && (
              <fieldset className="options">
                <legend className="sr-only">Size</legend>
                {sizes.map((s) => (
                  <label key={s} className="option">
                    <input type="radio" name="lab-size" value={s} checked={s === size} onChange={() => setSize(s)} />
                    <span>{s}</span>
                  </label>
                ))}
              </fieldset>
            )}
            <div className="sheet__actions">
              <button type="button" className="btn btn--primary btn--block" onClick={addToBag}>
                Add to bag
              </button>
              <p className="note">Limited run · RAW members get 24h early access</p>
            </div>
          </div>
        )}
      </Sheet>

      {checkout && (
        <CheckoutSheet
          open
          onClose={() => setCheckout(null)}
          product={checkout}
          size={isApparel(checkout.name) ? size : "One size"}
        />
      )}
    </div>
  );
}
