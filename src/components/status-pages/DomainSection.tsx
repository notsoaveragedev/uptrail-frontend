import { useMutation } from "@tanstack/react-query";
import { Button } from "antd";
import { LuCircleCheck, LuCircleX, LuCopy } from "react-icons/lu";
import { verifyCustomDomain } from "@/api/statusPages";
import { CustomInput } from "@/components/ui/CustomInput";
import { Loader } from "@/components/ui/Loader";
import { useCopy } from "@/hooks/useCopy";
import { useToast } from "@/hooks/useToast";
import { CNAME_TARGET, cnameName, isValidHost } from "@/lib/statusPages";
import type { StatusPage } from "@/types/statusPage";

type CustomDomain = StatusPage["customDomain"];

type DomainSectionProps = {
  domain: CustomDomain;
  onChange: (domain: CustomDomain) => void;
};

export function DomainSection({ domain, onChange }: DomainSectionProps) {
  const toast = useToast();
  const host = domain?.host ?? "";
  const isHostValid = isValidHost(host);
  const verify = useMutation({
    mutationFn: verifyCustomDomain,
    onSuccess: (isVerified, checkedHost) => {
      if (!isVerified) return;
      onChange({ host: checkedHost, verified: true });
      toast.success("Domain verified", `TLS certificate issued for ${checkedHost}.`);
    },
    onError: () => toast.error("Couldn't check DNS", "Try again in a moment."),
  });

  function changeHost(next: string) {
    const trimmed = next.trim().toLowerCase();
    verify.reset();
    onChange(trimmed ? { host: trimmed, verified: false } : null);
  }

  return (
    <div className="flex flex-col gap-3">
      <CustomInput
        label="Domain"
        size="middle"
        value={host}
        placeholder="status.yourcompany.com"
        spellCheck={false}
        onChange={(event) => changeHost(event.target.value)}
        className="font-mono"
        error={host && !isHostValid ? "Enter a hostname like status.yourcompany.com." : null}
      />
      <DnsRecord name={cnameName(host)} />
      <div className="flex items-center justify-between gap-3">
        <VerifyState isVerified={!!domain?.verified} isChecking={verify.isPending} isNotFound={verify.data === false} />
        <Button
          size="small"
          disabled={!isHostValid || domain?.verified}
          loading={verify.isPending}
          onClick={() => verify.mutate(host)}
        >
          {verify.data === false ? "Retry" : "Verify"}
        </Button>
      </div>
    </div>
  );
}

function DnsRecord({ name }: { name: string }) {
  const copy = useCopy();
  const cells = [
    { label: "Type", value: "CNAME" },
    { label: "Name", value: name },
    { label: "Value", value: CNAME_TARGET },
  ];

  return (
    <dl className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 rounded-md border border-line bg-panel px-3 py-2">
      {cells.map((cell) => (
        <div key={cell.label} className="contents">
          <dt className="text-caps font-semibold tracking-wider text-subtle uppercase">{cell.label}</dt>
          <dd className="m-0 truncate font-mono text-xs text-ink">{cell.value}</dd>
          <Button
            type="text"
            size="small"
            aria-label={`Copy ${cell.label.toLowerCase()}`}
            icon={<LuCopy />}
            onClick={() => copy(cell.value, `${cell.label} copied`, cell.value)}
            className={cell.label === "Type" ? "invisible" : "text-subtle"}
          />
        </div>
      ))}
    </dl>
  );
}

type VerifyStateProps = {
  isVerified: boolean;
  isChecking: boolean;
  isNotFound: boolean;
};

function VerifyState({ isVerified, isChecking, isNotFound }: VerifyStateProps) {
  if (isChecking) {
    return (
      <span className="flex items-center gap-2 text-xs text-muted">
        <Loader size="sm" label="Checking DNS" />
        <span aria-hidden>Checking DNS…</span>
      </span>
    );
  }
  if (isVerified) {
    return (
      <span role="status" className="flex items-center gap-1.5 text-xs text-up">
        <LuCircleCheck aria-hidden className="size-3.5" /> Verified · TLS issued
      </span>
    );
  }
  if (isNotFound) {
    return (
      <span role="alert" className="flex flex-col text-xs">
        <span className="flex items-center gap-1.5 text-down">
          <LuCircleX aria-hidden className="size-3.5" /> CNAME not found
        </span>
        <span className="text-muted">DNS can take up to 1h to propagate.</span>
      </span>
    );
  }
  return <span className="text-xs text-muted">Add the record at your DNS provider, then verify.</span>;
}
