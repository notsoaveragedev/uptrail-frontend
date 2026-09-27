import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Modal } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useCreateDashboard } from "@/api/dashboards";
import { monitorsQuery } from "@/api/monitors";
import { CustomInput } from "@/components/ui/CustomInput";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";
import { createFromStart, newDashboardSchema } from "@/lib/dashboards";
import { PROJECT_OPTIONS } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import { StartOptionPicker } from "./StartOptionPicker";

type NewDashboardModalProps = {
  open: boolean;
  initialTemplate: string;
  onClose: () => void;
};

export function NewDashboardModal({ open, initialTemplate, onClose }: NewDashboardModalProps) {
  return (
    <Modal open={open} onCancel={onClose} title="New dashboard" footer={null} destroyOnHidden width="40rem">
      <NewDashboardForm initialTemplate={initialTemplate} onClose={onClose} />
    </Modal>
  );
}

function NewDashboardForm({ initialTemplate, onClose }: Omit<NewDashboardModalProps, "open">) {
  const navigate = useNavigate();
  const toast = useToast();
  const { orgSlug = "" } = useParams();
  const createDashboard = useCreateDashboard(orgSlug);
  const { data: monitors = [] } = useQuery(monitorsQuery(orgSlug));
  const [project, setProject] = useState(PROJECT_OPTIONS[0].value);
  const [template, setTemplate] = useState(initialTemplate);

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: newDashboardSchema,
    onSubmit: async (values) => {
      const dashboard = createFromStart(values, monitors);
      await createDashboard.mutateAsync(dashboard);
      onClose();
      toast.success("Dashboard created", "Arrange widgets, then save when it looks right.");
      navigate(paths.dashboard(orgSlug, dashboard.id, { edit: "1" }));
    },
  });

  return (
    <form {...formProps} className="flex flex-col gap-5 pt-2">
      {formError && <Alert type="error" showIcon title={formError} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <CustomInput label="Name" name="name" placeholder="Checkout health" autoFocus error={fieldErrors.name} />
        <CustomSelect
          label="Project"
          value={project}
          onChange={setProject}
          options={PROJECT_OPTIONS}
          error={fieldErrors.project}
        />
        <input type="hidden" name="project" value={project} />
      </div>
      <StartOptionPicker value={template} onChange={setTemplate} />
      <div className="flex justify-end gap-2">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          Create dashboard
        </Button>
      </div>
    </form>
  );
}
