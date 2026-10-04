import { signOut } from "@/lib/session";
import { useConfirm } from "./useConfirm";

export function useLogOut() {
  const confirm = useConfirm();

  return async () => {
    const isConfirmed = await confirm({
      title: "Log out of Uptrail?",
      description: "You'll need to sign in again to see your monitors.",
      confirmLabel: "Log out",
    });
    if (isConfirmed) signOut();
  };
}
