import { ColorPicker } from "antd";
import { useId, useState } from "react";
import { CustomInput } from "@/components/ui/CustomInput";
import { FieldShell } from "@/components/ui/FieldShell";
import { isHexColor } from "@/lib/statusTheme";

type ColorFieldProps = {
  label: string;
  value: string;
  presets: string[];
  onChange: (color: string) => void;
};

export function ColorField({ label, value, presets, onChange }: ColorFieldProps) {
  const id = useId();
  const [text, setText] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const isValid = isHexColor(text) && text.startsWith("#");

  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(value);
  }

  function changeText(next: string) {
    setText(next);
    if (isHexColor(next) && next.startsWith("#") && next.length === 7) onChange(next.toUpperCase());
  }

  return (
    <FieldShell label={label} htmlFor={id}>
      <div className="flex items-start gap-2">
        <ColorPicker
          value={value}
          disabledAlpha
          presets={[{ label: "Presets", colors: presets, defaultOpen: true }]}
          onChange={(color) => onChange(color.toHexString().toUpperCase())}
          aria-label={`Pick ${label.toLowerCase()}`}
        />
        <div className="flex-1">
          <CustomInput
            id={id}
            size="middle"
            value={text}
            maxLength={7}
            spellCheck={false}
            onChange={(event) => changeText(event.target.value)}
            onBlur={() => setText(value)}
            className="font-mono"
            error={isValid ? null : "Use a hex colour like #1F2937."}
          />
        </div>
      </div>
    </FieldShell>
  );
}
