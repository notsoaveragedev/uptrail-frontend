import { useQuery } from "@tanstack/react-query";
import { LuCheck } from "react-icons/lu";
import { slugAvailabilityQuery } from "@/api/org";
import { CustomInput } from "@/components/ui/CustomInput";
import { Loader } from "@/components/ui/Loader";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type SlugFieldProps = {
  value: string;
  currentSlug: string;
  error?: string;
  onChange: (slug: string) => void;
};

export function SlugField({ value, currentSlug, error, onChange }: SlugFieldProps) {
  const debounced = useDebouncedValue(value, 400);
  const { data: isAvailable, isFetching } = useQuery(slugAvailabilityQuery(debounced, currentSlug));
  const isChanged = value !== currentSlug;

  return (
    <CustomInput
      label="URL slug"
      name="slug"
      value={value}
      onChange={(event) => onChange(event.target.value.toLowerCase())}
      addonBefore={<span className="font-mono text-xs text-subtle">uptrail.app/o/</span>}
      className="font-mono"
      error={error ?? (isChanged && debounced === value && isAvailable === false ? `${value} is taken.` : null)}
      hint={
        isChanged &&
        !error && <Availability isChecking={isFetching || debounced !== value} isAvailable={isAvailable} slug={value} />
      }
    />
  );
}

function Availability({ isChecking, isAvailable, slug }: { isChecking: boolean; isAvailable?: boolean; slug: string }) {
  if (isChecking) {
    return (
      <span className="flex items-center gap-1.5">
        <Loader size="sm" /> Checking availability…
      </span>
    );
  }
  if (!isAvailable) return null;
  return (
    <span className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1.5 text-up">
        <LuCheck aria-hidden className="size-3.5" /> {slug} is available
      </span>
      <span>Old app links will stop working. Status page URLs don't change.</span>
    </span>
  );
}
