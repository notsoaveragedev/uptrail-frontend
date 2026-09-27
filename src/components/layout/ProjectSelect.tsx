import { Select } from "antd";
import { LuFolder } from "react-icons/lu";
import { useSearchParams } from "react-router";
import { projects } from "@/mocks/workspace";

export function ProjectSelect() {
  const [searchParams, setSearchParams] = useSearchParams();
  const project = searchParams.get("project") ?? "all";

  function change(value: string) {
    setSearchParams((params) => {
      if (value === "all") params.delete("project");
      else params.set("project", value);
      return params;
    });
  }

  return (
    <Select
      aria-label="Project"
      value={project}
      onChange={change}
      options={projects}
      prefix={<LuFolder className="size-4 text-subtle" />}
      className="w-full"
    />
  );
}
