import { useQuery } from "@tanstack/react-query";
import { subscribersQuery } from "@/api/statusPages";
import { CountBadge } from "@/components/ui/CountBadge";

export function SubscriberCount({ orgSlug, pageId }: { orgSlug: string; pageId: string }) {
  const { data: subscribers } = useQuery(subscribersQuery(orgSlug, pageId));
  if (!subscribers) return null;
  return <CountBadge count={subscribers.length} isMuted />;
}
