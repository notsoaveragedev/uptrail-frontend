import type { CompareOperator, ExpressionNode, ExpressionValue } from "@/types/alerts";
import { OPERATORS_BY_TYPE, operandField, operandFromKey, operandKey } from "./catalog";

export const MAX_DEPTH = 3;

export type Combinator = "and" | "or";

export type VisualCondition = {
  kind: "condition";
  id: string;
  metric: string;
  op: CompareOperator;
  value: ExpressionValue | null;
};

export type VisualGroup = {
  kind: "group";
  id: string;
  combinator: Combinator;
  children: VisualNode[];
};

export type VisualNode = VisualCondition | VisualGroup;

let lastId = 0;

function nextId() {
  lastId += 1;
  return `node_${lastId}`;
}

export function newCondition(metric = "p95(latency)"): VisualCondition {
  const field = operandField(operandFromKey(metric));
  return { kind: "condition", id: nextId(), metric, op: OPERATORS_BY_TYPE[field.type][0], value: field.defaultValue };
}

export function newGroup(combinator: Combinator = "and", children: VisualNode[] = [newCondition()]): VisualGroup {
  return { kind: "group", id: nextId(), combinator, children };
}

function toVisualNode(node: ExpressionNode): VisualNode {
  if (node.type === "compare") {
    return { kind: "condition", id: nextId(), metric: operandKey(node.left), op: node.op, value: node.right };
  }
  return { kind: "group", id: nextId(), combinator: node.type, children: node.children.map(toVisualNode) };
}

export function astToVisual(ast: ExpressionNode): VisualGroup {
  const node = toVisualNode(ast);
  return node.kind === "group" ? node : newGroup("and", [node]);
}

export function visualToAst(node: VisualNode): ExpressionNode | null {
  if (node.kind === "condition") {
    if (node.value === null || node.value === "") return null;
    return { type: "compare", op: node.op, left: operandFromKey(node.metric), right: node.value };
  }
  const children = node.children.map(visualToAst);
  if (children.length === 0 || children.some((child) => child === null)) return null;
  const valid = children as ExpressionNode[];
  return valid.length === 1 ? valid[0] : { type: node.combinator, children: valid };
}

export function astDepth(node: ExpressionNode): number {
  if (node.type === "compare") return 0;
  return 1 + Math.max(...node.children.map(astDepth));
}

export function fitsVisual(ast: ExpressionNode) {
  return Math.max(1, astDepth(ast)) <= MAX_DEPTH;
}

function mapGroups(group: VisualGroup, update: (group: VisualGroup) => VisualGroup): VisualGroup {
  const children = group.children.map((child) => (child.kind === "group" ? mapGroups(child, update) : child));
  return update({ ...group, children });
}

function updateGroup(root: VisualGroup, groupId: string, update: (group: VisualGroup) => VisualGroup) {
  return mapGroups(root, (group) => (group.id === groupId ? update(group) : group));
}

export function findParent(root: VisualGroup, id: string): VisualGroup | null {
  for (const child of root.children) {
    if (child.id === id) return root;
    if (child.kind === "group") {
      const parent = findParent(child, id);
      if (parent) return parent;
    }
  }
  return null;
}

export function groupDepth(root: VisualGroup, groupId: string): number {
  if (root.id === groupId) return 1;
  const parent = findParent(root, groupId);
  return parent ? groupDepth(root, parent.id) + 1 : 0;
}

export function canAddGroup(root: VisualGroup, groupId: string) {
  return groupDepth(root, groupId) < MAX_DEPTH;
}

export function addCondition(root: VisualGroup, groupId: string) {
  return updateGroup(root, groupId, (group) => ({ ...group, children: [...group.children, newCondition()] }));
}

export function addGroup(root: VisualGroup, groupId: string) {
  if (!canAddGroup(root, groupId)) return root;
  return updateGroup(root, groupId, (group) => {
    const combinator = group.combinator === "and" ? "or" : "and";
    return { ...group, children: [...group.children, newGroup(combinator)] };
  });
}

export function setCombinator(root: VisualGroup, groupId: string, combinator: Combinator) {
  return updateGroup(root, groupId, (group) => ({ ...group, combinator }));
}

export function removeNode(root: VisualGroup, id: string) {
  return mapGroups(root, (group) => ({ ...group, children: group.children.filter((child) => child.id !== id) }));
}

export function updateCondition(root: VisualGroup, id: string, patch: Partial<Omit<VisualCondition, "kind" | "id">>) {
  return mapGroups(root, (group) => ({
    ...group,
    children: group.children.map((child) =>
      child.id === id && child.kind === "condition" ? { ...child, ...patch } : child,
    ),
  }));
}

export function changeMetric(condition: VisualCondition, metric: string): Partial<VisualCondition> {
  const previous = operandField(operandFromKey(condition.metric));
  const next = operandField(operandFromKey(metric));
  if (previous.name === next.name) return { metric };
  const op = OPERATORS_BY_TYPE[next.type].includes(condition.op) ? condition.op : OPERATORS_BY_TYPE[next.type][0];
  return { metric, op, value: next.defaultValue };
}

export function moveNodeTo(root: VisualGroup, id: string, index: number) {
  const parent = findParent(root, id);
  if (!parent) return root;
  const target = Math.max(0, Math.min(index, parent.children.length - 1));
  return updateGroup(root, parent.id, (group) => {
    const children = group.children.filter((child) => child.id !== id);
    const moving = group.children.find((child) => child.id === id)!;
    children.splice(target, 0, moving);
    return { ...group, children };
  });
}

export function moveNode(root: VisualGroup, id: string, offset: number) {
  const parent = findParent(root, id);
  if (!parent) return root;
  return moveNodeTo(root, id, parent.children.findIndex((child) => child.id === id) + offset);
}

export function nodePosition(root: VisualGroup, id: string) {
  const parent = findParent(root, id);
  if (!parent) return null;
  return { index: parent.children.findIndex((child) => child.id === id), count: parent.children.length };
}

export function countConditions(node: VisualNode): number {
  return node.kind === "condition" ? 1 : node.children.reduce((sum, child) => sum + countConditions(child), 0);
}
