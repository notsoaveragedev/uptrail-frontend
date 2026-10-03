import { useNavigate } from "react-router";
import { useConfirm } from "./useConfirm";
import { useToast } from "./useToast";

export function useLeaveOrganization() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  return async (orgName: string) => {
    const isConfirmed = await confirm({
      title: `Leave ${orgName}?`,
      description: "You'll lose access to its monitors and dashboards until someone invites you again.",
      confirmLabel: "Leave organization",
      isDanger: true,
    });
    if (!isConfirmed) return;
    navigate("/");
    toast.info(`You left ${orgName}`);
  };
}
