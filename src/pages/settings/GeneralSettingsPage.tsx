import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { orgSettingsQuery } from "@/api/org";
import { GeneralSettingsForm } from "@/components/settings/GeneralSettingsForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";

export function GeneralSettingsPage() {
  const { orgSlug = "" } = useParams();
  const { data: settings } = useQuery(orgSettingsQuery(orgSlug));

  return (
    <>
      <title>General · Settings · Uptrail</title>
      <PageHeader level={2} title="General" meta="Your organization's name, address and defaults." />
      {settings ? (
        <GeneralSettingsForm key={JSON.stringify(settings)} settings={settings} />
      ) : (
        <div aria-busy className="flex flex-col gap-6">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock key={index} isInset className="h-16" />
          ))}
        </div>
      )}
    </>
  );
}
