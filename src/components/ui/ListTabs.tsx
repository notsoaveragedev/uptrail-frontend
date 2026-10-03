import { Segmented } from "antd";
import { TabLabel } from "./TabLabel";

type ListTabsProps<Value extends string> = {
  label: string;
  value: Value;
  onChange: (value: Value) => void;
  tabs: { value: Value; label: string; count?: number }[];
};

export function ListTabs<Value extends string>({ label, value, onChange, tabs }: ListTabsProps<Value>) {
  return (
    <Segmented
      aria-label={label}
      value={value}
      onChange={onChange}
      options={tabs.map((tab) => ({
        value: tab.value,
        label: <TabLabel label={tab.label} count={tab.count} isMuted={tab.value !== value} />,
      }))}
    />
  );
}
