import { Input } from "antd";
import { useId, useState } from "react";
import { flushSync } from "react-dom";
import { FieldShell } from "@/components/ui/FieldShell";

type OtpFieldProps = {
  error?: string;
  onComplete: () => void;
};

export function OtpField({ error, onComplete }: OtpFieldProps) {
  const labelId = useId();
  const messageId = useId();
  const [code, setCode] = useState("");

  function complete(value: string) {
    flushSync(() => setCode(value));
    onComplete();
  }

  return (
    <FieldShell label="Authentication code" labelId={labelId} error={error} messageId={messageId}>
      <div role="group" aria-labelledby={labelId} aria-describedby={error ? messageId : undefined}>
        <Input.OTP
          length={6}
          size="large"
          autoFocus
          autoComplete="one-time-code"
          inputMode="numeric"
          status={error ? "error" : undefined}
          formatter={(value) => value.replace(/\D/g, "")}
          onInput={(cells) => setCode(cells.join(""))}
          onChange={complete}
        />
      </div>
      <input type="hidden" name="code" value={code} />
    </FieldShell>
  );
}
