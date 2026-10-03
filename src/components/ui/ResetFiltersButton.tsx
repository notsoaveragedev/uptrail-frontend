import { Button } from "antd";

export function ResetFiltersButton({ isVisible, onClick }: { isVisible: boolean; onClick: () => void }) {
  if (!isVisible) return null;
  return (
    <Button type="text" onClick={onClick}>
      Reset
    </Button>
  );
}
