import { Avatar, Button, Progress, Upload } from "antd";
import { LuTrash2, LuUpload } from "react-icons/lu";
import { useImageUpload } from "@/hooks/useImageUpload";
import { initials } from "@/lib/people";

type AvatarUploadProps = {
  name: string;
  avatarUrl: string | null;
  onChange: (avatarUrl: string | null) => void;
};

export function AvatarUpload({ name, avatarUrl, onChange }: AvatarUploadProps) {
  const { progress, upload } = useImageUpload({ label: "Photo", maxBytes: 2 * 1024 * 1024, onUploaded: onChange });

  return (
    <div className="flex items-center gap-4">
      <Avatar
        src={avatarUrl}
        alt=""
        className="size-16 shrink-0 bg-hover text-md font-semibold text-muted [&_img]:object-cover"
      >
        {initials(name)}
      </Avatar>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Upload
            accept="image/png,image/jpeg,image/webp"
            showUploadList={false}
            beforeUpload={(file) => {
              upload(file);
              return false;
            }}
          >
            <Button icon={<LuUpload />} loading={progress !== null}>
              Upload photo
            </Button>
          </Upload>
          {avatarUrl && (
            <Button type="text" icon={<LuTrash2 />} onClick={() => onChange(null)}>
              Remove
            </Button>
          )}
        </div>
        {progress === null ? (
          <span className="text-xs text-subtle">PNG, JPG or WebP · 2 MB · cropped to a circle</span>
        ) : (
          <Progress percent={progress} size="small" showInfo={false} className="m-0 w-40" />
        )}
      </div>
    </div>
  );
}
