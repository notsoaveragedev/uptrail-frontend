import { DrawerSection } from "./DrawerSection";

type HeaderListProps = {
  title: string;
  headers: Record<string, string> | null;
};

export function HeaderList({ title, headers }: HeaderListProps) {
  const entries = Object.entries(headers ?? {});

  return (
    <DrawerSection title={title}>
      {entries.length === 0 ? (
        <p className="text-xs text-subtle">Headers are stored for failed checks only.</p>
      ) : (
        <dl className="grid grid-cols-[minmax(0,9rem)_1fr] gap-x-4 gap-y-1.5 font-mono text-xs">
          {entries.map(([name, value]) => (
            <div key={name} className="contents">
              <dt className="truncate text-subtle" title={name}>
                {name}
              </dt>
              <dd className="break-all text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </DrawerSection>
  );
}
