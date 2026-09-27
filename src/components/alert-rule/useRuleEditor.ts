import { useMemo, useState } from "react";
import { parse } from "@/lib/alertExpression/parse";
import { print } from "@/lib/alertExpression/print";
import { astToVisual, fitsVisual, newGroup, visualToAst, type VisualGroup } from "@/lib/alertExpression/visual";
import {
  isSameDraft,
  validateDraft,
  type ConditionMode,
  type ConditionValidity,
  type RuleDraft,
  type RuleErrors,
} from "./ruleFormUtils";

function initialTree(expression: string) {
  const result = parse(expression);
  return result.ok && fitsVisual(result.ast) ? astToVisual(result.ast) : newGroup();
}

function initialMode(expression: string): ConditionMode {
  const result = parse(expression);
  return result.ok && fitsVisual(result.ast) ? "visual" : "text";
}

function conditionValidity(mode: ConditionMode, isVisualComplete: boolean, isTextValid: boolean): ConditionValidity {
  if (mode === "visual") return isVisualComplete ? "valid" : "incomplete";
  return isTextValid ? "valid" : "invalid";
}

export function useRuleEditor(initial: RuleDraft) {
  const [draft, setDraft] = useState(initial);
  const [mode, setMode] = useState<ConditionMode>(() => initialMode(initial.expression));
  const [tree, setTree] = useState<VisualGroup>(() => initialTree(initial.expression));
  const [errors, setErrors] = useState<RuleErrors>({});
  const parsed = useMemo(() => parse(draft.expression), [draft.expression]);

  const visualAst = mode === "visual" ? visualToAst(tree) : null;
  const ast = mode === "visual" ? visualAst : parsed.ok ? parsed.ast : null;
  const isDirty = !isSameDraft(draft, initial);

  function update(patch: Partial<RuleDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    const cleared = Object.keys(patch).filter((key) => key in errors);
    if (cleared.length > 0) {
      setErrors((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !cleared.includes(key))));
    }
  }

  function updateTree(next: VisualGroup) {
    setTree(next);
    const nextAst = visualToAst(next);
    if (nextAst) update({ expression: print(nextAst) });
  }

  function switchMode(next: ConditionMode) {
    if (next === "visual") {
      if (!parsed.ok || !fitsVisual(parsed.ast)) return;
      setTree(astToVisual(parsed.ast));
    }
    setMode(next);
  }

  function validate() {
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    return { isValid: Object.keys(nextErrors).length === 0 && ast !== null, errors: nextErrors };
  }

  return {
    draft,
    update,
    mode,
    switchMode,
    tree,
    updateTree,
    parsed,
    ast,
    validity: conditionValidity(mode, visualAst !== null, parsed.ok),
    isDirty,
    errors,
    validate,
  };
}
