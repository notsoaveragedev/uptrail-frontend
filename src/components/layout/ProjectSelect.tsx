import { LuFolder } from "react-icons/lu";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useStoredState } from "@/hooks/useStoredState";
import { PROJECT_OPTIONS } from "@/lib/monitors";

const OPTIONS = [{ value: "all", label: "All projects" }, ...PROJECT_OPTIONS];

export function ProjectSelect() {
  const [project, setProject] = useStoredState("uptrail:project", "all");

  return (
    <CustomSelect
      size="middle"
      aria-label="Project"
      value={project}
      onChange={setProject}
      options={OPTIONS}
      prefix={<LuFolder className="size-4 text-subtle" />}
    />
  );
}
