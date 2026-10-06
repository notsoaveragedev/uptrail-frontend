import { LinkButton } from "@/components/ui/LinkButton";
import { DEFAULT_APP_PATH } from "@/lib/safeRedirect";

const LABELS = {
  signedIn: { full: "Open your dashboard", compact: "Open app" },
  signedOut: { full: "Start monitoring free", compact: "Start free" },
};

type StartButtonProps = {
  isSignedIn: boolean;
  isCompact?: boolean;
};

export function StartButton({ isSignedIn, isCompact = false }: StartButtonProps) {
  const label = LABELS[isSignedIn ? "signedIn" : "signedOut"][isCompact ? "compact" : "full"];

  return (
    <LinkButton type="primary" size={isCompact ? "middle" : "large"} to={isSignedIn ? DEFAULT_APP_PATH : "/signup"}>
      {label}
    </LinkButton>
  );
}
