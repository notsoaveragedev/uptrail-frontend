import { describe, expect, it } from "vitest";
import { BILLING_BY_ORG } from "@/mocks/billing";
import {
  downgradeLosses,
  formatExpiryInput,
  groupCardNumber,
  isFutureExpiry,
  isLuhnValid,
  isOverFreeLimits,
  limitWarning,
  toPaymentMethod,
  usageLevel,
} from "./billing";

const pro = BILLING_BY_ORG.pixelcraft;
const free = BILLING_BY_ORG["meera-labs"];

describe("usageLevel", () => {
  it("is ok below 80%, near from 80% and at the limit from 100%", () => {
    expect(usageLevel(15, 20)).toBe("ok");
    expect(usageLevel(16, 20)).toBe("near");
    expect(usageLevel(20, 20)).toBe("at");
    expect(usageLevel(25, 20)).toBe("at");
  });
});

describe("card input", () => {
  it("accepts a valid test card and rejects a mistyped one", () => {
    expect(isLuhnValid("4242 4242 4242 4242")).toBe(true);
    expect(isLuhnValid("4242 4242 4242 4241")).toBe(false);
    expect(isLuhnValid("4242")).toBe(false);
  });

  it("groups card numbers and formats expiry as you type", () => {
    expect(groupCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatExpiryInput("0828")).toBe("08/28");
    expect(formatExpiryInput("1")).toBe("1");
  });

  it("checks expiry against the current month", () => {
    const now = new Date(2026, 9, 9);
    expect(isFutureExpiry("10/26", now)).toBe(true);
    expect(isFutureExpiry("09/26", now)).toBe(false);
    expect(isFutureExpiry("13/30", now)).toBe(false);
  });

  it("detects the card brand and last four digits", () => {
    expect(toPaymentMethod("5555 5555 5555 4444", "08/28")).toEqual({
      brand: "mastercard",
      last4: "4444",
      expMonth: 8,
      expYear: 2028,
    });
  });
});

describe("plan limits", () => {
  it("warns a Free org that has hit its member limit", () => {
    expect(limitWarning(free)?.level).toBe("at");
    expect(limitWarning(pro)).toBeNull();
  });

  it("warns about monitors when members are fine", () => {
    const nearMonitors = { ...free, usage: { ...free.usage, members: 1 } };
    expect(limitWarning(nearMonitors)?.title).toBe("You're close to your monitor limit");
  });

  it("lists what a Pro org loses when it cancels", () => {
    expect(isOverFreeLimits(pro)).toBe(true);
    expect(downgradeLosses(pro)[0]).toBe("22 monitors over the Free limit are paused, newest first.");
  });
});
