import { Button, Input } from "antd";
import { useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";
import { useCopy } from "@/hooks/useCopy";

type CopyFieldProps = {
  value: string;
  label: string;
  onCopied?: () => void;
};

export function CopyField({ value, label, onCopied }: CopyFieldProps) {
  const copy = useCopy();
  const [isCopied, setIsCopied] = useState(false);

  async function copyValue() {
    await copy(value, `${label} copied`);
    setIsCopied(true);
    onCopied?.();
  }

  return (
    <span className="flex gap-2">
      <Input
        readOnly
        value={value}
        aria-label={label}
        className="font-mono text-xs"
        onFocus={(event) => event.target.select()}
      />
      <Button
        aria-label={`Copy ${label}`}
        icon={isCopied ? <LuCheck className="text-up" /> : <LuCopy />}
        onClick={copyValue}
      >
        {isCopied ? "Copied" : "Copy"}
      </Button>
    </span>
  );
}
