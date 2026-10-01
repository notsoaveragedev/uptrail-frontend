import { Input, Segmented } from "antd";
import { useId } from "react";
import { CustomInput } from "@/components/ui/CustomInput";
import { FieldShell } from "@/components/ui/FieldShell";
import { COLOR_PRESETS, MODE_OPTIONS, modeHint } from "@/lib/statusPages";
import type { StatusPage, StatusTheme } from "@/types/statusPage";
import { ColorField } from "./ColorField";
import { ContrastChecks } from "./ContrastChecks";
import { LogoUpload } from "./LogoUpload";

type BrandingSectionProps = {
  page: StatusPage;
  onChange: (patch: Partial<StatusPage>) => void;
};

export function BrandingSection({ page, onChange }: BrandingSectionProps) {
  const ids = { description: useId(), mode: useId() };
  const { theme } = page;

  function changeTheme(patch: Partial<StatusTheme>) {
    onChange({ theme: { ...theme, ...patch } });
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldShell label="Logo">
        <LogoUpload
          title={page.title}
          logoUrl={page.logoUrl}
          color={theme.primary}
          onChange={(logoUrl) => onChange({ logoUrl })}
        />
      </FieldShell>
      <CustomInput
        label="Title"
        size="middle"
        value={page.title}
        maxLength={60}
        onChange={(event) => onChange({ title: event.target.value })}
        error={page.title.trim() ? null : "Give the page a title."}
      />
      <FieldShell label="Description" htmlFor={ids.description}>
        <Input.TextArea
          id={ids.description}
          value={page.description}
          maxLength={160}
          showCount
          autoSize={{ minRows: 2, maxRows: 4 }}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </FieldShell>
      <ColorField
        label="Primary"
        value={theme.primary}
        presets={COLOR_PRESETS.primary}
        onChange={(primary) => changeTheme({ primary })}
      />
      <ColorField
        label="Background"
        value={theme.background}
        presets={COLOR_PRESETS.background}
        onChange={(background) => changeTheme({ background })}
      />
      <ColorField
        label="Text"
        value={theme.text}
        presets={COLOR_PRESETS.text}
        onChange={(text) => changeTheme({ text })}
      />
      <FieldShell label="Mode" labelId={ids.mode} hint={modeHint(theme)}>
        <Segmented<StatusTheme["mode"]>
          block
          aria-labelledby={ids.mode}
          value={theme.mode}
          onChange={(mode) => changeTheme({ mode })}
          options={MODE_OPTIONS}
        />
      </FieldShell>
      <ContrastChecks theme={theme} onFix={changeTheme} />
    </div>
  );
}
