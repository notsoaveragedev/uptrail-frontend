import type { ExpressionNode, ExpressionValue } from "@/types/alerts";
import { operandKey } from "./catalog";

function printValue(value: ExpressionValue) {
  return typeof value === "string" ? `"${value}"` : String(value);
}

function printChild(child: ExpressionNode, parentType: "and" | "or") {
  const text = print(child);
  return parentType === "and" && child.type === "or" ? `(${text})` : text;
}

export function print(node: ExpressionNode): string {
  if (node.type === "compare") return `${operandKey(node.left)} ${node.op} ${printValue(node.right)}`;
  return node.children.map((child) => printChild(child, node.type)).join(` ${node.type} `);
}
