import { useState } from "react";
import { CustomInput } from "@/components/ui/CustomInput";
import { formatExpiryInput, groupCardNumber } from "@/lib/billing";

type CardErrors = Partial<Record<"cardNumber" | "expiry" | "cvc" | "cardName", string>>;

export function CardFields({ errors }: { errors: CardErrors }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <CustomInput
        label="Card number"
        name="cardNumber"
        inputMode="numeric"
        autoComplete="cc-number"
        placeholder="1234 1234 1234 1234"
        value={cardNumber}
        onChange={(event) => setCardNumber(groupCardNumber(event.target.value))}
        className="font-mono"
        error={errors.cardNumber}
      />
      <div className="grid grid-cols-2 gap-3">
        <CustomInput
          label="Expiry"
          name="expiry"
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/YY"
          value={expiry}
          onChange={(event) => setExpiry(formatExpiryInput(event.target.value))}
          className="font-mono"
          error={errors.expiry}
        />
        <CustomInput
          label="CVC"
          name="cvc"
          inputMode="numeric"
          autoComplete="cc-csc"
          maxLength={4}
          placeholder="123"
          className="font-mono"
          error={errors.cvc}
        />
      </div>
      <CustomInput label="Name on card" name="cardName" autoComplete="cc-name" error={errors.cardName} />
    </div>
  );
}
