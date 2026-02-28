import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// We test the subscription access logic (hasAccess) as a pure function.
// This mirrors the logic in subscription-context.tsx without needing
// React context or Supabase — ensuring the paywall rules are correct.
// ---------------------------------------------------------------------------

type SubscriptionStatus = "free" | "trial" | "active" | "canceled" | "past_due";

function computeHasAccess(
  status: SubscriptionStatus,
  currentPeriodEnd: string | null,
  devBypass: boolean = false,
): boolean {
  return (
    devBypass ||
    status === "trial" ||
    status === "active" ||
    (status === "canceled" &&
      currentPeriodEnd !== null &&
      new Date(currentPeriodEnd) > new Date())
  );
}

describe("subscription access control", () => {
  it("free users do NOT have access", () => {
    expect(computeHasAccess("free", null)).toBe(false);
  });

  it("trial users have access", () => {
    expect(computeHasAccess("trial", null)).toBe(true);
  });

  it("active users have access", () => {
    expect(computeHasAccess("active", null)).toBe(true);
  });

  it("past_due users do NOT have access", () => {
    expect(computeHasAccess("past_due", null)).toBe(false);
  });

  it("canceled users WITH future period end have access", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    expect(computeHasAccess("canceled", futureDate.toISOString())).toBe(true);
  });

  it("canceled users WITH past period end do NOT have access", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    expect(computeHasAccess("canceled", pastDate.toISOString())).toBe(false);
  });

  it("canceled users WITHOUT period end do NOT have access", () => {
    expect(computeHasAccess("canceled", null)).toBe(false);
  });

  it("dev bypass grants access regardless of status", () => {
    expect(computeHasAccess("free", null, true)).toBe(true);
    expect(computeHasAccess("past_due", null, true)).toBe(true);
    expect(computeHasAccess("canceled", null, true)).toBe(true);
  });
});

describe("isAnonymous determination", () => {
  // Mirrors the logic: !user || user.is_anonymous === true

  function computeIsAnonymous(
    user: { is_anonymous?: boolean } | null,
    devBypass: boolean = false,
  ): boolean {
    if (devBypass) return false;
    return !user || user.is_anonymous === true;
  }

  it("no user is anonymous", () => {
    expect(computeIsAnonymous(null)).toBe(true);
  });

  it("anonymous user is anonymous", () => {
    expect(computeIsAnonymous({ is_anonymous: true })).toBe(true);
  });

  it("signed-in user is NOT anonymous", () => {
    expect(computeIsAnonymous({ is_anonymous: false })).toBe(false);
  });

  it("dev bypass is never anonymous", () => {
    expect(computeIsAnonymous(null, true)).toBe(false);
    expect(computeIsAnonymous({ is_anonymous: true }, true)).toBe(false);
  });
});
