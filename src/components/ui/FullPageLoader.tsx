import { Spin } from "antd";

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <Spin size="large" />
    </div>
  );
}
