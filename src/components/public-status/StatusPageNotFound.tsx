import type { ReactNode } from "react";
import { LuSearchX } from "react-icons/lu";
import { StatusScreen } from "@/components/errors/StatusScreen";
import { PublicShell } from "./PublicShell";

type StatusPageNotFoundProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function StatusPageNotFound({
  eyebrow = "404",
  title = "Status page not found",
  description = "This status page doesn't exist or isn't published. Check the address and try again.",
  action,
}: StatusPageNotFoundProps) {
  return (
    <PublicShell>
      <title>{title}</title>
      <StatusScreen icon={<LuSearchX />} eyebrow={eyebrow} title={title} description={description} actions={action} />
    </PublicShell>
  );
}
