import { describe, expect, it } from "vitest";
import {
  addItem,
  breakpointForWidth,
  collides,
  compact,
  firstFreeSlot,
  gridMetrics,
  insertItem,
  itemRect,
  layoutHeight,
  moveItem,
  nudgeItem,
  removeItem,
  resizeItem,
  scaleLayout,
  type Layout,
} from "./gridLayout";

function item(i: string, x: number, y: number, w: number, h: number) {
  return { i, x, y, w, h };
}

function find(layout: Layout, id: string) {
  const found = layout.find((entry) => entry.i === id);
  if (!found) throw new Error(`Missing ${id}`);
  return found;
}

function hasOverlaps(layout: Layout) {
  return layout.some((a) => layout.some((b) => collides(a, b)));
}

describe("collides", () => {
  it("detects overlapping rectangles", () => {
    expect(collides(item("a", 0, 0, 4, 4), item("b", 3, 3, 2, 2))).toBe(true);
  });

  it("treats touching edges as free", () => {
    expect(collides(item("a", 0, 0, 4, 4), item("b", 4, 0, 2, 2))).toBe(false);
    expect(collides(item("a", 0, 0, 4, 4), item("b", 0, 4, 2, 2))).toBe(false);
  });

  it("never collides an item with itself", () => {
    expect(collides(item("a", 0, 0, 4, 4), item("a", 1, 1, 4, 4))).toBe(false);
  });
});

describe("compact", () => {
  it("floats items up into empty rows", () => {
    const layout = compact([item("a", 0, 5, 4, 2), item("b", 4, 9, 4, 3)]);
    expect(find(layout, "a").y).toBe(0);
    expect(find(layout, "b").y).toBe(0);
  });

  it("stacks items that share columns", () => {
    const layout = compact([item("a", 0, 3, 6, 2), item("b", 2, 10, 6, 3)]);
    expect(find(layout, "a").y).toBe(0);
    expect(find(layout, "b").y).toBe(2);
  });

  it("resolves overlaps by moving later items down", () => {
    const layout = compact([item("a", 0, 0, 6, 4), item("b", 0, 2, 6, 2)]);
    expect(find(layout, "b").y).toBe(4);
    expect(hasOverlaps(layout)).toBe(false);
  });

  it("keeps the original array order", () => {
    const layout = compact([item("b", 0, 8, 2, 2), item("a", 0, 0, 2, 2)]);
    expect(layout.map((entry) => entry.i)).toEqual(["b", "a"]);
  });
});

describe("moveItem", () => {
  it("moves into free space and compacts", () => {
    const layout = moveItem([item("a", 0, 0, 4, 2), item("b", 4, 0, 4, 2)], "a", 8, 6, 12);
    expect(find(layout, "a")).toEqual(item("a", 8, 0, 4, 2));
  });

  it("pushes a collider down below the moved item", () => {
    const layout = moveItem([item("a", 0, 0, 6, 3), item("b", 6, 0, 6, 3)], "a", 4, 0, 12);
    expect(find(layout, "a")).toMatchObject({ x: 4, y: 0 });
    expect(find(layout, "b")).toMatchObject({ x: 6, y: 3 });
  });

  it("cascades pushes through a column", () => {
    const start = [item("a", 0, 0, 4, 2), item("b", 4, 0, 4, 2), item("c", 4, 2, 4, 2), item("d", 4, 4, 4, 2)];
    const layout = moveItem(start, "a", 4, 0, 12);
    expect(find(layout, "a")).toMatchObject({ x: 4, y: 0 });
    expect(find(layout, "b").y).toBe(2);
    expect(find(layout, "c").y).toBe(4);
    expect(find(layout, "d").y).toBe(6);
    expect(hasOverlaps(layout)).toBe(false);
  });

  it("swaps with the item below once dragged past its height", () => {
    const layout = moveItem([item("a", 0, 0, 12, 3), item("b", 0, 3, 12, 3)], "a", 0, 3, 12);
    expect(find(layout, "b").y).toBe(0);
    expect(find(layout, "a").y).toBe(3);
  });

  it("clamps into the grid bounds", () => {
    const layout = moveItem([item("a", 0, 0, 4, 2)], "a", 11, -3, 12);
    expect(find(layout, "a")).toEqual(item("a", 8, 0, 4, 2));
  });

  it("returns the layout untouched for an unknown id", () => {
    const start = [item("a", 0, 0, 4, 2)];
    expect(moveItem(start, "missing", 2, 2, 12)).toBe(start);
  });
});

describe("resizeItem", () => {
  it("grows and pushes neighbours below", () => {
    const layout = resizeItem([item("a", 0, 0, 4, 2), item("b", 0, 2, 4, 2)], "a", 4, 5, 12);
    expect(find(layout, "a").h).toBe(5);
    expect(find(layout, "b").y).toBe(5);
  });

  it("clamps to the minimum size", () => {
    const layout = resizeItem([item("a", 0, 0, 6, 6)], "a", 1, 1, 12, { w: 4, h: 5 });
    expect(find(layout, "a")).toMatchObject({ w: 4, h: 5 });
  });

  it("clamps the width to the remaining columns", () => {
    const layout = resizeItem([item("a", 8, 0, 2, 2)], "a", 10, 2, 12);
    expect(find(layout, "a")).toMatchObject({ x: 8, w: 4 });
  });

  it("caps a minimum width wider than the grid", () => {
    const layout = resizeItem([item("a", 0, 0, 4, 4)], "a", 2, 4, 4, { w: 6, h: 2 });
    expect(find(layout, "a")).toMatchObject({ x: 0, w: 4 });
  });
});

describe("nudgeItem", () => {
  const stacked = [item("a", 0, 0, 12, 3), item("b", 0, 3, 12, 4)];

  it("moves down past the next item in one step", () => {
    const layout = nudgeItem(stacked, "a", 0, 1, 12);
    expect(find(layout, "b").y).toBe(0);
    expect(find(layout, "a").y).toBe(4);
  });

  it("moves up past the previous item in one step", () => {
    const layout = nudgeItem(stacked, "b", 0, -1, 12);
    expect(find(layout, "b").y).toBe(0);
    expect(find(layout, "a").y).toBe(4);
  });

  it("moves sideways by one column", () => {
    const layout = nudgeItem([item("a", 2, 0, 4, 2)], "a", 1, 0, 12);
    expect(find(layout, "a").x).toBe(3);
  });

  it("stays put at the top edge", () => {
    expect(nudgeItem(stacked, "a", 0, -1, 12)).toBe(stacked);
  });
});

describe("firstFreeSlot", () => {
  it("returns the origin for an empty layout", () => {
    expect(firstFreeSlot([], { w: 6, h: 4 }, 12)).toEqual({ x: 0, y: 0, w: 6, h: 4 });
  });

  it("finds a gap beside existing items", () => {
    expect(firstFreeSlot([item("a", 0, 0, 6, 4)], { w: 6, h: 4 }, 12)).toMatchObject({ x: 6, y: 0 });
  });

  it("finds a hole in the middle of the layout", () => {
    const layout = [item("a", 0, 0, 12, 2), item("b", 0, 2, 4, 4), item("c", 8, 2, 4, 4), item("d", 0, 6, 12, 2)];
    expect(firstFreeSlot(layout, { w: 4, h: 4 }, 12)).toMatchObject({ x: 4, y: 2 });
  });

  it("falls back to the bottom when nothing fits", () => {
    expect(firstFreeSlot([item("a", 0, 0, 12, 3)], { w: 4, h: 2 }, 12)).toMatchObject({ x: 0, y: 3 });
  });

  it("caps the width to the column count", () => {
    expect(firstFreeSlot([], { w: 12, h: 2 }, 4)).toMatchObject({ w: 4 });
  });

  it("adds an item without overlaps", () => {
    const layout = addItem([item("a", 0, 0, 8, 3)], "b", { w: 6, h: 3 }, 12);
    expect(find(layout, "b")).toMatchObject({ x: 0, y: 3 });
    expect(hasOverlaps(layout)).toBe(false);
  });
});

describe("insertItem and removeItem", () => {
  it("restores an item at its old spot and pushes the rest down", () => {
    const removed = removeItem([item("a", 0, 0, 12, 2), item("b", 0, 2, 12, 2)], "a");
    expect(find(removed, "b").y).toBe(0);
    const restored = insertItem(removed, item("a", 0, 0, 12, 2), 12);
    expect(find(restored, "a").y).toBe(0);
    expect(find(restored, "b").y).toBe(2);
  });
});

describe("scaleLayout", () => {
  const lg = [item("a", 0, 0, 6, 4), item("b", 6, 0, 6, 4), item("c", 0, 4, 12, 3)];

  it("scales columns proportionally for tablets", () => {
    const md = scaleLayout(lg, 8);
    expect(find(md, "a")).toMatchObject({ x: 0, w: 4 });
    expect(find(md, "b")).toMatchObject({ x: 4, w: 4, y: 0 });
    expect(find(md, "c")).toMatchObject({ w: 8, y: 4 });
    expect(hasOverlaps(md)).toBe(false);
  });

  it("stacks every item full width on phones in reading order", () => {
    const sm = scaleLayout(lg, 4);
    expect(sm.map(({ i, x, y, w }) => ({ i, x, y, w }))).toEqual([
      { i: "a", x: 0, y: 0, w: 4 },
      { i: "b", x: 0, y: 4, w: 4 },
      { i: "c", x: 0, y: 8, w: 4 },
    ]);
  });
});

describe("geometry", () => {
  it("picks breakpoints from the container width", () => {
    expect(breakpointForWidth(1136)).toBe("lg");
    expect(breakpointForWidth(768)).toBe("md");
    expect(breakpointForWidth(390)).toBe("sm");
  });

  it("measures the layout height in rows", () => {
    expect(layoutHeight([item("a", 0, 0, 2, 3), item("b", 2, 1, 2, 5)])).toBe(6);
    expect(layoutHeight([])).toBe(0);
  });

  it("converts cells to pixels with gaps", () => {
    const metrics = gridMetrics(1136, 12, 16);
    expect(metrics.colWidth).toBeCloseTo(80);
    expect(itemRect(item("a", 1, 1, 2, 2), metrics)).toEqual({ left: 96, top: 56, width: 176, height: 96 });
  });
});
