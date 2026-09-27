import { InputNumber } from "antd";
import { CustomSelect } from "@/components/ui/CustomSelect";
import type { FieldDefinition } from "@/lib/alertExpression/catalog";
import { regionCity } from "@/lib/monitors";
import type { ExpressionValue } from "@/types/alerts";
import type { RegionCode } from "@/types/monitor";

type ConditionValueProps = {
  field: FieldDefinition;
  value: ExpressionValue | null;
  label: string;
  onChange: (value: ExpressionValue | null) => void;
};

function enumLabel(field: FieldDefinition, value: string) {
  return field.name === "region" ? `${value} · ${regionCity(value as RegionCode)}` : value;
}

export function ConditionValue({ field, value, label, onChange }: ConditionValueProps) {
  if (field.values) {
    return (
      <div className="w-36 shrink-0">
        <CustomSelect<string>
          size="middle"
          aria-label={label}
          value={typeof value === "string" ? value : undefined}
          onChange={onChange}
          options={field.values.map((option) => ({ value: option, label: enumLabel(field, option) }))}
          className="w-full font-mono text-xs"
        />
      </div>
    );
  }

  return (
    <InputNumber<number>
      aria-label={label}
      value={typeof value === "number" ? value : null}
      onChange={(next) => onChange(next)}
      min={0}
      controls={false}
      suffix={field.unit ? <span className="font-mono text-xs text-subtle">{field.unit}</span> : undefined}
      status={value === null ? "error" : undefined}
      className="w-36 shrink-0 font-mono text-xs"
    />
  );
}
