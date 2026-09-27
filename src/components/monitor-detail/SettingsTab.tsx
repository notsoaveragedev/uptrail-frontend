import { Button, Tag } from "antd";
import type { ReactNode } from "react";
import { LuLock, LuPencil } from "react-icons/lu";
import { useNavigate, useParams } from "react-router";
import { Card } from "@/components/ui/Card";
import { formatInterval, regionCity } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import type { MonitorConfig } from "@/types/monitorDetail";

const MASK = "••••••••••••";

export function SettingsTab({ monitorId, config }: { monitorId: string; config: MonitorConfig }) {
  const { orgSlug = "" } = useParams();
  const navigate = useNavigate();
  const editMonitor = () => navigate(paths.monitorEdit(orgSlug, monitorId));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted">Read-only view of this monitor's configuration.</p>
        <Button type="primary" icon={<LuPencil />} onClick={editMonitor}>
          Edit monitor
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="Request">
          <dl className="border-t border-line">
            <Row label="URL">
              <span className="font-mono text-xs break-all">{config.url}</span>
            </Row>
            <Row label="Method">
              <span className="font-mono text-xs">{config.method}</span>
            </Row>
            <Row label="Headers">
              <ul className="flex flex-col gap-1 font-mono text-xs">
                {config.headers.map((header) => (
                  <li key={header.name} className="flex flex-wrap items-center gap-2">
                    <span className="text-series-2">{header.name}:</span>
                    <span className={header.isSecret ? "text-subtle" : "text-ink"}>
                      {header.isSecret ? MASK : header.value}
                    </span>
                    {header.isSecret && (
                      <span className="flex items-center gap-1 text-caps text-subtle uppercase">
                        <LuLock aria-hidden className="size-3" />
                        secret
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </Row>
            {config.body && (
              <Row label="Body">
                <pre className="m-0 rounded-md border border-line bg-panel px-2.5 py-2 font-mono text-xs whitespace-pre-wrap">
                  {config.body}
                </pre>
              </Row>
            )}
            <Row label="Expected status">
              <span className="font-mono text-xs">{config.expectedStatus}</span>
            </Row>
            <Row label="Assertions">
              <ul className="flex flex-col gap-1.5">
                {config.assertions.map((assertion) => (
                  <li key={assertion}>
                    <code className="rounded-sm border border-line bg-panel px-1.5 py-0.5 font-mono text-xs">
                      {assertion}
                    </code>
                  </li>
                ))}
              </ul>
            </Row>
          </dl>
        </Card>

        <Card title="Schedule & alerts">
          <dl className="border-t border-line">
            <Row label="Interval">
              <span className="font-mono text-xs">every {formatInterval(config.intervalSec)}</span>
            </Row>
            <Row label="Timeout">
              <span className="font-mono text-xs">{config.timeoutMs.toLocaleString()} ms</span>
            </Row>
            <Row label="Regions">
              <ul className="flex flex-col gap-1">
                {config.regions.map((code) => (
                  <li key={code}>
                    <span className="font-mono text-xs">{code}</span>{" "}
                    <span className="text-muted">{regionCity(code)}</span>
                  </li>
                ))}
              </ul>
            </Row>
            <Row label="Follow redirects">{config.followRedirects ? "Yes" : "No"}</Row>
            <Row label="SSL expiry alert">
              <span className="font-mono text-xs">{config.sslExpiryDays} days before</span>
            </Row>
            <Row label="Tags">
              <span className="flex flex-wrap gap-1.5">
                {config.tags.map((tag) => (
                  <Tag key={tag} className="m-0 font-mono text-xs">
                    {tag}
                  </Tag>
                ))}
              </span>
            </Row>
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-4 border-b border-line px-4 py-3 last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="m-0">{children}</dd>
    </div>
  );
}
