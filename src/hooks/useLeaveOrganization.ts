import { useNavigate } from "react-router";
import { DEFAULT_APP_PATH } from "@/lib/safeRedirect";
import { useConfirm } from "./useConfirm";
import { useToast } from "./useToast";

type LeaveOptions = { isLastOrg?: boolean; onLeft?: () => void };

export function useLeaveOrganization() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  return async (orgName: string, { isLastOrg = false, onLeft }: LeaveOptions = {}) => {
    const isConfirmed = await confirm({
      title: `Leave ${orgName}?`,
      description: `You'll lose access to its monitors and dashboards until someone invites you again.${isLastOrg ? " You'll need to create or join another organization." : ""}`,
      confirmLabel: "Leave organization",
      isDanger: true,
    });
    if (!isConfirmed) return;
    if (onLeft) onLeft();
    else navigate(DEFAULT_APP_PATH);
    toast.info(`You left ${orgName}`);
  };
}
