import { Button, Table, Tooltip, type TableColumnsType } from "antd";
import { LuDownload, LuReceipt } from "react-icons/lu";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/useToast";
import { formatCents, INVOICE_BADGE } from "@/lib/billing";
import { formatDay, formatLongDate } from "@/lib/format";
import { TONE_BADGE } from "@/lib/status";
import type { Invoice } from "@/types/billing";

export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  const toast = useToast();

  const columns: TableColumnsType<Invoice> = [
    {
      title: "Invoice",
      key: "number",
      render: (_, invoice) => <span className="font-mono text-xs">{invoice.number}</span>,
    },
    { title: "Date", key: "date", render: (_, invoice) => formatLongDate(invoice.issuedAt) },
    {
      title: "Period",
      key: "period",
      responsive: ["sm"],
      render: (_, invoice) => (
        <span className="text-muted">
          {formatDay(invoice.periodStart)} to {formatDay(invoice.periodEnd)}
        </span>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      align: "right",
      render: (_, invoice) => <span className="font-mono text-xs">{formatCents(invoice.amountCents)}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, invoice) => {
        const badge = INVOICE_BADGE[invoice.status];
        return (
          <span
            className={`inline-flex h-5 items-center rounded-sm px-1.5 text-xs font-medium ${TONE_BADGE[badge.tone]}`}
          >
            {badge.label}
          </span>
        );
      },
    },
    {
      title: <span className="sr-only">Actions</span>,
      key: "actions",
      width: 56,
      align: "right",
      render: (_, invoice) => (
        <Tooltip title="Download PDF">
          <Button
            type="text"
            size="small"
            aria-label={`Download ${invoice.number}`}
            icon={<LuDownload />}
            onClick={() => toast.success(`Downloading ${invoice.number}`, "PDF, 1 page.")}
            className="row-actions"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={invoices}
      size="small"
      rowClassName="group"
      scroll={{ x: "max-content" }}
      pagination={invoices.length > 6 ? { pageSize: 6, size: "small", showSizeChanger: false } : false}
      locale={{
        emptyText: (
          <EmptyState
            icon={<LuReceipt />}
            title="No invoices yet"
            description="Invoices appear here after your first payment."
          />
        ),
      }}
    />
  );
}
