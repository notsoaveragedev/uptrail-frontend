import { useQuery } from "@tanstack/react-query";
import { accountQuery } from "@/api/account";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

export function ProfilePage() {
  const { data: account } = useQuery(accountQuery);

  return (
    <>
      <title>Profile · Account · Uptrail</title>
      <PageHeader level={2} title="Profile" meta="Your name, photo and how Uptrail looks for you." />
      {account ? (
        <ProfileForm key={account.name + account.timezone} account={account} />
      ) : (
        <div aria-busy className="flex flex-col gap-6">
          <SkeletonBlock isInset className="size-16 rounded-full" />
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock key={index} isInset className="h-10" />
          ))}
        </div>
      )}
    </>
  );
}
