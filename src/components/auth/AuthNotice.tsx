import { Spin } from "antd";
import type { ReactNode } from "react";
import { LuCircleCheck, LuCircleX, LuClock, LuMail } from "react-icons/lu";
import { AuthHeading } from "./AuthHeading";

type Tone = "pending" | "info" | "success" | "warning" | "error";

const TONE_ICONS: Record<Tone, ReactNode> = {
  pending: <Spin size="small" />,
  info: <LuMail className="text-muted" />,
  success: <LuCircleCheck className="text-up" />,
  warning: <LuClock className="text-degraded" />,
  error: <LuCircleX className="text-down" />,
};

type AuthNoticeProps = {
  tone: Tone;
  route: string;
  title: string;
  description: ReactNode;
  children?: ReactNode;
};

export function AuthNotice({ tone, route, title, description, children }: AuthNoticeProps) {
  return (
    <>
      <span className="mb-6 flex size-10 items-center justify-center rounded-lg border border-line bg-card [&_svg]:size-5">
        {TONE_ICONS[tone]}
      </span>
      <AuthHeading route={route} title={title} description={description} />
      {children && <div className="flex flex-col gap-3">{children}</div>}
    </>
  );
}
