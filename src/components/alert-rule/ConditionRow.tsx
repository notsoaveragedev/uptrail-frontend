import { CustomSelect } from "@/components/ui/CustomSelect";
import { METRICS, OPERATORS_BY_TYPE, operandField, operandFromKey } from "@/lib/alertExpression/catalog";
import { changeMetric, updateCondition, type VisualCondition } from "@/lib/alertExpression/visual";
import type { CompareOperator } from "@/types/alerts";
import type { Builder } from "./builderUtils";
import { ConditionValue } from "./ConditionValue";
import { RowActions } from "./RowActions";
import { RowGrip } from "./RowGrip";

const METRIC_OPTIONS = METRICS.map((metric) => ({ value: metric.key, label: metric.key, hint: metric.hint }));

type ConditionRowProps = {
  condition: VisualCondition;
  builder: Builder;
};

export function ConditionRow({ condition, builder }: ConditionRowProps) {
  const field = operandField(operandFromKey(condition.metric));

  function update(patch: Partial<VisualCondition>) {
    builder.change(updateCondition(builder.root, condition.id, patch));
  }

  return (
    <div className="group/row flex items-center gap-2">
      <RowGrip node={condition} builder={builder} />
      <div className="w-44 shrink-0">
        <CustomSelect<string>
          size="middle"
          aria-label="Metric"
          value={condition.metric}
          onChange={(metric) => update(changeMetric(condition, metric))}
          options={METRIC_OPTIONS}
          showSearch={{ optionFilterProp: "label" }}
          popupMatchSelectWidth={false}
          optionRender={(option) => (
            <span className="flex flex-col">
              <span className="font-mono text-xs">{option.data.label}</span>
              <span className="text-xs text-subtle">{option.data.hint}</span>
            </span>
          )}
          className="w-full font-mono text-xs"
        />
      </div>
      <div className="w-18 shrink-0">
        <CustomSelect<CompareOperator>
          size="middle"
          aria-label="Operator"
          value={condition.op}
          onChange={(op) => update({ op })}
          options={OPERATORS_BY_TYPE[field.type].map((op) => ({ value: op, label: op }))}
          className="w-full font-mono text-xs"
        />
      </div>
      <ConditionValue field={field} value={condition.value} label="Value" onChange={(value) => update({ value })} />
      <RowActions node={condition} builder={builder} />
    </div>
  );
}
