import { Button, Checkbox } from "antd";
import { LuCopy, LuDownload, LuPrinter } from "react-icons/lu";
import { useCopy } from "@/hooks/useCopy";
import { downloadBlob } from "@/lib/download";

type BackupCodesPanelProps = {
  codes: string[];
  isSaved: boolean;
  onSavedChange: (isSaved: boolean) => void;
};

export function BackupCodesPanel({ codes, isSaved, onSavedChange }: BackupCodesPanelProps) {
  const copy = useCopy();
  const text = codes.join("\n");

  return (
    <div className="flex flex-col gap-3">
      <ol className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-md border border-line bg-panel p-4 font-mono text-sm">
        {codes.map((code, index) => (
          <li key={code} className="flex gap-3">
            <span className="w-4 text-right text-xs text-faint">{index + 1}</span>
            <span className="text-ink">{code}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button size="small" icon={<LuCopy />} onClick={() => copy(text, "Backup codes copied")}>
          Copy all
        </Button>
        <Button
          size="small"
          icon={<LuDownload />}
          onClick={() => downloadBlob(new Blob([text], { type: "text/plain" }), "uptrail-backup-codes.txt")}
        >
          Download .txt
        </Button>
        <Button size="small" icon={<LuPrinter />} onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <Checkbox checked={isSaved} onChange={(event) => onSavedChange(event.target.checked)}>
        I've saved my backup codes somewhere safe
      </Checkbox>
    </div>
  );
}
