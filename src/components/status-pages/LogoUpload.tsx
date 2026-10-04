import { Button, Progress, Upload } from "antd";
import { LuImageUp, LuTrash2 } from "react-icons/lu";
import { useImageUpload } from "@/hooks/useImageUpload";
import { PageLogo } from "./PageLogo";

type LogoUploadProps = {
  title: string;
  logoUrl: string | null;
  color: string;
  onChange: (logoUrl: string | null) => void;
};

const MAX_BYTES = 1024 * 1024;

export function LogoUpload({ title, logoUrl, color, onChange }: LogoUploadProps) {
  const { progress, upload } = useImageUpload({ label: "Logo", maxBytes: MAX_BYTES, onUploaded: onChange });

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
