import { CustomInput } from "./CustomInput";

type ToolbarSearchProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function ToolbarSearch({ label, placeholder, value, onChange, className = "ml-auto" }: ToolbarSearchProps) {
  return (
    <div className={`w-64 ${className}`}>
      <CustomInput
        type="search"
        size="middle"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
