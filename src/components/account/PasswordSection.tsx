import { useQuery } from "@tanstack/react-query";
import { Alert, Button } from "antd";
import { useState } from "react";
import { Link } from "react-router";
import { sessionsQuery, useRevokeSessions, useSaveSecurity } from "@/api/account";
import { NewPasswordField } from "@/components/auth/NewPasswordField";
import { SwitchField } from "@/components/ui/SwitchField";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { CustomInput } from "@/components/ui/CustomInput";
import { useForm } from "@/hooks/useForm";
import { useToast } from "@/hooks/useToast";
import { plural } from "@/lib/format";
import { changePasswordSchema } from "@/lib/schemas";
import type { SecurityState } from "@/types/account";

export function PasswordSection({ security }: { security: SecurityState }) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-md border border-line px-3 py-2.5">
        <span className="flex flex-col">
          <span className="font-mono text-ink">••••••••••</span>
          <span className="text-xs text-subtle">
            Changed <TimeAgo timestamp={security.passwordChangedAt} intervalMs={60_000} />
          </span>
        </span>
        <Button onClick={() => setIsEditing(true)}>Change password</Button>
      </div>
    );
  }

  return <PasswordForm security={security} onDone={() => setIsEditing(false)} />;
}

function PasswordForm({ security, onDone }: { security: SecurityState; onDone: () => void }) {
  const toast = useToast();
  const save = useSaveSecurity();
  const revoke = useRevokeSessions();
  const { data: sessions = [] } = useQuery(sessionsQuery);
  const [signOutOthers, setSignOutOthers] = useState(true);
  const others = sessions.filter((session) => !session.isCurrent);

  const { formProps, fieldErrors, formError, isPending } = useForm({
    schema: changePasswordSchema,
    onSubmit: async (values) => {
      await save.mutateAsync({ ...security, passwordChangedAt: Date.now() });
      if (values.signOutOthers && others.length) revoke.mutate(others.map((session) => session.id));
      toast.success(
        "Password changed",
        values.signOutOthers && others.length ? `${plural(others.length, "other session")} signed out` : undefined,
      );
      onDone();
    },
  });

  return (
    <form {...formProps} className="flex flex-col gap-4 rounded-md border border-line p-4">
      {formError && <Alert type="error" showIcon title={formError} />}
      <CustomInput
        label="Current password"
        name="currentPassword"
        type="password"
        autoFocus
        autoComplete="current-password"
        labelAction={
          <Link to="/forgot-password" className="text-xs">
            Forgot?
          </Link>
        }
        error={fieldErrors.currentPassword}
      />
      <NewPasswordField label="New password" error={fieldErrors.password} />
      <CustomInput
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
      />
      <SwitchField
        name="signOutOthers"
        label="Sign out of other sessions"
        hint="Recommended if you think someone else knows your password."
        checked={signOutOthers}
        onChange={setSignOutOthers}
      />
      <div className="flex justify-end gap-2">
        <Button onClick={onDone}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isPending}>
          Update password
        </Button>
      </div>
    </form>
  );
}
