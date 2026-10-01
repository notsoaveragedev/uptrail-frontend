import { Button, Progress, Upload } from "antd";
import { useEffect, useRef, useState } from "react";
import { LuImageUp, LuTrash2 } from "react-icons/lu";
import { useToast } from "@/hooks/useToast";
import { PageLogo } from "./PageLogo";

type LogoUploadProps = {
  title: string;
  logoUrl: string | null;
  color: string;
  onChange: (logoUrl: string | null) => void;
};

const MAX_BYTES = 1024 * 1024;

export function LogoUpload({ title, logoUrl, color, onChange }: LogoUploadProps) {
  const toast = useToast();
  const [progress, setProgress] = useState<number | null>(null);
  const timerRef = useRef<number>(undefined);

  useEffect(() => () => window.clearInterval(timerRef.current), []);

  function upload(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("That file isn't an image", "Use a PNG, SVG or JPG.");
    if (file.size > MAX_BYTES) return toast.error("Logo is too large", "Keep it under 1 MB.");
    window.clearInterval(timerRef.current);
    let percent = 0;
    setProgress(percent);
    timerRef.current = window.setInterval(() => {
      percent += 20;
      if (percent < 100) return setProgress(percent);
      window.clearInterval(timerRef.current);
      setProgress(null);
      onChange(URL.createObjectURL(file));
      toast.success("Logo uploaded", file.name);
    }, 150);
  }

  return (
    <div className="flex items-center gap-3">
      <PageLogo title={title} logoUrl={logoUrl} color={color} />
      <Upload.Dragger
        accept="image/png,image/svg+xml,image/jpeg,image/webp"
        showUploadList={false}
        beforeUpload={(file) => {
          upload(file);
          return false;
        }}
        className="flex-1"
      >
        {progress === null ? (
          <span className="flex h-5 items-center justify-center gap-2 text-muted">
            <LuImageUp aria-hidden className="size-4" />
            <span>
              Drop a logo or <span className="text-accent">browse</span>
            </span>
            <span className="text-xs text-subtle">SVG, PNG · 1 MB</span>
          </span>
        ) : (
          <span className="flex h-5 items-center gap-3 px-3">
            <span className="text-xs text-muted">Uploading</span>
            <Progress percent={progress} size="small" showInfo={false} className="m-0 flex-1" />
          </span>
        )}
      </Upload.Dragger>
      {logoUrl && <Button type="text" aria-label="Remove logo" icon={<LuTrash2 />} onClick={() => onChange(null)} />}
    </div>
  );
}
