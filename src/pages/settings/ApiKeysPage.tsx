import { useQuery } from "@tanstack/react-query";
import { Button } from "antd";
import { lazy, Suspense, useState } from "react";
import { LuKeyRound, LuPlus } from "react-icons/lu";
import { useParams } from "react-router";
import { apiKeysQuery } from "@/api/apiKeys";
import { ApiKeysTable } from "@/components/api-keys/ApiKeysTable";
import { ApiKeysToolbar } from "@/components/api-keys/ApiKeysToolbar";
import { SectionErrorBoundary } from "@/components/errors/SectionErrorBoundary";
import { Can } from "@/components/rbac/Can";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetaList } from "@/components/ui/MetaList";
import { PageHeader } from "@/components/ui/PageHeader";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { useApiKeyFilters } from "@/hooks/useApiKeyFilters";
import { useNow } from "@/hooks/useNow";
import { apiKeyStatus, filterApiKeys } from "@/lib/apiKeys";
import { DAY_MS, isExpiringSoon } from "@/lib/dates";
import { formatAgo } from "@/lib/format";
import { importWithReload } from "@/lib/lazyPage";
import type { ApiKey } from "@/types/apiKey";

const CreateApiKeyModal = lazy(() =>
  importWithReload(() => import("@/components/api-keys/CreateApiKeyModal")).then((module) => ({
    default: module.CreateApiKeyModal,
  })),
);

export function ApiKeysPage() {
  const { orgSlug = "" } = useParams();
  const { data: keys } = useQuery(apiKeysQuery(orgSlug));
  const [isCreating, setIsCreating] = useState(false);
  const [hasOpenedCreate, setHasOpenedCreate] = useState(false);

  function openCreate() {
    setHasOpenedCreate(true);
    setIsCreating(true);
  }

  return (
    <>
      <title>API keys · Settings · Uptrail</title>
      <PageHeader
        level={2}
        title="API keys"
        meta={keys && <KeysSummary keys={keys} />}
        actions={
          <Can permission="apikey:manage">
            <Button type="primary" icon={<LuPlus />} onClick={openCreate}>
              Create key
            </Button>
          </Can>
        }
      />
      {keys ? (
        <KeysView keys={keys} onCreate={openCreate} />
      ) : (
        <TableSkeleton columns={["flex-1", "w-32", "w-24", "w-24", "w-16", "w-16"]} />
      )}
      <Suspense fallback={null}>
        {hasOpenedCreate && <CreateApiKeyModal open={isCreating} onClose={() => setIsCreating(false)} />}
      </Suspense>
    </>
  );
}

function KeysSummary({ keys }: { keys: ApiKey[] }) {
  const now = useNow(60_000);
  const active = keys.filter((key) => apiKeyStatus(key, now) === "active");
  const expiring = active.filter((key) => key.expiresAt !== null && isExpiringSoon(key.expiresAt, now, 14 * DAY_MS));
  const lastUsed = Math.max(0, ...active.map((key) => key.lastUsedAt ?? 0));

  return (
    <MetaList>
      <span>
        <span className="font-mono text-ink">{active.length}</span> active
      </span>
      {expiring.length > 0 && (
        <span>
          <span className="font-mono text-degraded">{expiring.length}</span> expiring in 14 days
        </span>
      )}
      {lastUsed > 0 && <span>last used {formatAgo(lastUsed, now)}</span>}
    </MetaList>
  );
}

function KeysView({ keys, onCreate }: { keys: ApiKey[]; onCreate: () => void }) {
  const now = useNow(60_000);
  const { tab, filters, hasFilters, clear } = useApiKeyFilters();
  const activeCount = keys.filter((key) => apiKeyStatus(key, now) === "active").length;

  return (
    <div className="flex flex-col gap-3">
      <ApiKeysToolbar keys={keys} tabCounts={{ active: activeCount, inactive: keys.length - activeCount }} />
      <SectionErrorBoundary>
        <ApiKeysTable
          keys={filterApiKeys(keys, tab, filters, now)}
          emptyText={
            hasFilters ? (
              <EmptyState icon={<LuKeyRound />} title="No keys match these filters" onClear={clear} />
            ) : tab === "active" ? (
              <EmptyState
                icon={<LuKeyRound />}
                title="No active keys"
                description="Use API keys to manage monitors from CI, Terraform or your own scripts."
                action={<Button onClick={onCreate}>Create key</Button>}
              />
            ) : (
              <EmptyState icon={<LuKeyRound />} title="No revoked or expired keys" />
            )
          }
        />
      </SectionErrorBoundary>
    </div>
  );
}
