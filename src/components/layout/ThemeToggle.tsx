import { Button, Tooltip } from "antd";
import { LuMoon, LuSun } from "react-icons/lu";
import { useThemeMode } from "@/theme/ThemeContext";

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const label = mode === "dark" ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Tooltip title={label}>
      <Button
        aria-label={label}
        icon={mode === "dark" ? <LuSun className="size-4" /> : <LuMoon className="size-4" />}
        onClick={toggleMode}
      />
    </Tooltip>
  );
}
