import { Table, type TableColumnsType } from "antd";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { TimeAgo } from "@/components/monitors/TimeAgo";
import { formatForDuration } from "@/lib/alerts";
import { ruleChannelIds } from "@/lib/alertLists";
import { isRowControl } from "@/lib/dom";
import { projectLabel } from "@/lib/monitors";
import { paths } from "@/lib/paths";
import type { AlertChannel, AlertRule } from "@/types/alerts";
import { ChannelStack } from "./ChannelStack";
import { ExpressionCell } from "./ExpressionCell";
import { RuleEnabledSwitch } from "./RuleEnabledSwitch";
import { RuleStateLabel } from "./RuleStateLabel";
import { SeverityTag } from "./SeverityTag";

type RulesTableProps = {
  rules: AlertRule[];
  channels: AlertChannel[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  emptyText: ReactNode;
};

export function RulesTable({ rules, channels, selectedIds, onSelect, emptyText }: RulesTableProps) {
  const navigate = useNavigate();
  const { orgSlug = "" } = useParams();

  const channelsFor = (rule: AlertRule) =>
    ruleChannelIds(rule).flatMap((id) => channels.filter((channel) => channel.id === id));

  const columns: TableColumnsType<AlertRule> = [
    {
      title: "State",
      key: "state",
      width: 100,
      render: (_, rule) => <RuleStateLabel state={rule.state} />,
    },
    {
      title: "Name",
      key: "name",
      width: 220,
      render: (_, rule) => (
        <span className="flex min-w-0 flex-col">
          <Link
            to={paths.alertRule(orgSlug, rule.id)}
            className="truncate font-medium text-ink hover:text-ink hover:underline"
          >
            {rule.name}
          </Link>
          <span className="font-mono text-xs text-subtle">{formatForDuration(rule.forSeconds)}</span>
        </span>
      ),
    },
    {
      title: "Expression",
      key: "expression",
      render: (_, rule) => <ExpressionCell expression={rule.expression} />,
    },
    {
      title: "Project",
      key: "project",
      width: 112,
      render: (_, rule) => <span className="text-muted">{projectLabel(rule.project)}</span>,
    },
    {
      title: "Channels",
      key: "channels",
      width: 100,
      render: (_, rule) => <ChannelStack channels={channelsFor(rule)} />,
    },
    {
      title: "Severity",
      key: "severity",
      width: 100,
      render: (_, rule) => <SeverityTag severity={rule.severity} />,
    },
    {
      title: "Last fired",
      key: "lastFired",
      width: 100,
      render: (_, rule) => (
        <span className="font-mono text-xs text-subtle">
          <TimeAgo timestamp={rule.lastFiredAt} intervalMs={30_000} />
        </span>
      ),
    },
    {
      title: "Enabled",
      key: "enabled",
      width: 84,
      align: "right",
      render: (_, rule) => <RuleEnabledSwitch rule={rule} />,
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={rules}
      tableLayout="fixed"
      scroll={{ x: 1120 }}
      rowClassName={(rule) =>
        `group cursor-pointer ${rule.enabled ? "" : "text-muted [&_td]:opacity-70"} ${rule.state === "firing" && rule.enabled ? "[&>td]:bg-down-soft/40" : ""}`
      }
      onRow={(rule) => ({
        onClick: (event) => {
          if (isRowControl(event.target)) return;
          navigate(paths.alertRule(orgSlug, rule.id));
        },
      })}
      rowSelection={{
        selectedRowKeys: selectedIds,
        onChange: (keys) => onSelect(keys as string[]),
        columnWidth: 44,
      }}
      pagination={false}
      locale={{ emptyText }}
      className="rounded-lg border border-line bg-card"
    />
  );
}
