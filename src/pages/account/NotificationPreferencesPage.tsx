import { useQuery } from "@tanstack/react-query";
import { accountQuery, notificationPreferencesQuery } from "@/api/account";
import { NotificationPreferencesForm } from "@/components/account/NotificationPreferencesForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export function NotificationPreferencesPage() {
  const { data: preferences } = useQuery(notificationPreferencesQuery);
  const { data: account } = useQuery(accountQuery);

  return (
    <>
      <title>Notifications · Account · Uptrail</title>
      <PageHeader
        level={2}
        title="Notifications"
        meta="Choose what reaches you in the app and by email, per project."
      />
      {preferences && account ? (
        <NotificationPreferencesForm
          key={JSON.stringify(preferences)}
          preferences={preferences}
          email={account.email}
          timezone={account.timezone}
        />
      ) : (
        <TableSkeleton columns={["flex-1", "w-12", "w-12", "w-40"]} rows={8} />
      )}
    </>
  );
}
