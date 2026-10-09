import { useState } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { COUNTRIES } from "@/lib/billing";

export function CountryField({ defaultValue, error }: { defaultValue: string; error?: string }) {
  const [country, setCountry] = useState(defaultValue);

  return (
    <>
      <CustomSelect
        label="Country"
        value={country}
        onChange={setCountry}
        options={COUNTRIES.map((name) => ({ value: name, label: name }))}
        error={error}
      />
      <input type="hidden" name="country" value={country} />
    </>
  );
}
