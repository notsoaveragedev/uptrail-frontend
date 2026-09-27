import { describe, expect, it } from "vitest";
import type { ExpressionNode } from "@/types/alerts";
import { parse } from "./parse";
import { print } from "./print";
import {
  addCondition,
  addGroup,
  astToVisual,
  canAddGroup,
  changeMetric,
  fitsVisual,
  moveNode,
  moveNodeTo,
  newCondition,
  removeNode,
  setCombinator,
  updateCondition,
  visualToAst,
  type VisualCondition,
  type VisualGroup,
} from "./visual";

function ast(text: string): ExpressionNode {
  const result = parse(text);
  if (!result.ok) throw new Error(result.error.message);
  return result.ast;
}

function text(root: VisualGroup) {
  const node = visualToAst(root);
  return node ? print(node) : null;
}

describe("visual builder conversion", () => {
  it("round-trips AST through the visual tree", () => {
    const source = ast('p99(latency) > 1500 and region == "FRA" or error_rate > 2');
    expect(visualToAst(astToVisual(source))).toEqual(source);
  });

  it("wraps a single comparison in a root group", () => {
    const root = astToVisual(ast("latency > 5"));
    expect(root.kind).toBe("group");
    expect(root.children).toHaveLength(1);
    expect(text(root)).toBe("latency > 5");
  });

  it("returns null for incomplete trees", () => {
    const root = astToVisual(ast("latency > 5"));
    const condition = root.children[0] as VisualCondition;
    expect(visualToAst(updateCondition(root, condition.id, { value: null }))).toBeNull();
    expect(visualToAst({ ...root, children: [] })).toBeNull();
  });

  it("adds, updates and removes nodes", () => {
    let root = astToVisual(ast("latency > 5"));
    root = addCondition(root, root.id);
    expect(text(root)).toBe("latency > 5 and p95(latency) > 800");
    root = setCombinator(root, root.id, "or");
    expect(text(root)).toBe("latency > 5 or p95(latency) > 800");
    root = removeNode(root, root.children[0].id);
    expect(text(root)).toBe("p95(latency) > 800");
  });

  it("nests groups up to the maximum depth", () => {
    let root = astToVisual(ast("latency > 5"));
    root = addGroup(root, root.id);
    const second = root.children[1] as VisualGroup;
    expect(text(root)).toBe("latency > 5 and p95(latency) > 800");
    root = addGroup(root, second.id);
    const third = (root.children[1] as VisualGroup).children[1] as VisualGroup;
    expect(canAddGroup(root, third.id)).toBe(false);
    expect(addGroup(root, third.id)).toBe(root);
    expect(fitsVisual(ast("latency > 1 and (latency > 2 or (latency > 3 and error_rate > 1))"))).toBe(true);
    expect(fitsVisual(ast("latency > 1 and (latency > 2 or (latency > 3 and (latency > 4 or error_rate > 1)))"))).toBe(
      false,
    );
  });

  it("reorders siblings", () => {
    let root = astToVisual(ast("latency > 1 and error_rate > 2 and status_code > 3"));
    const [first] = root.children;
    root = moveNode(root, first.id, 1);
    expect(text(root)).toBe("error_rate > 2 and latency > 1 and status_code > 3");
    root = moveNodeTo(root, first.id, 99);
    expect(text(root)).toBe("error_rate > 2 and status_code > 3 and latency > 1");
    root = moveNode(root, first.id, -5);
    expect(text(root)).toBe("latency > 1 and error_rate > 2 and status_code > 3");
  });

  it("resets operator and value when the metric type changes", () => {
    const condition = newCondition("latency");
    expect(changeMetric(condition, "p95(latency)")).toEqual({ metric: "p95(latency)" });
    expect(changeMetric(condition, "status")).toEqual({ metric: "status", op: "==", value: "down" });
  });
});
