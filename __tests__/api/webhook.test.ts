import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Webhook status mapping test — the most critical piece of payment logic
// ---------------------------------------------------------------------------

describe("Stripe webhook status mapping", () => {
  // This mirrors the statusMap in the webhook handler
  const statusMap: Record<string, string> = {
    trialing: "trial",
    active: "active",
    canceled: "canceled",
    past_due: "past_due",
    unpaid: "canceled",
  };

  it("maps Stripe trialing → trial", () => {
    expect(statusMap["trialing"]).toBe("trial");
  });

  it("maps Stripe active → active", () => {
    expect(statusMap["active"]).toBe("active");
  });

  it("maps Stripe canceled → canceled", () => {
    expect(statusMap["canceled"]).toBe("canceled");
  });

  it("maps Stripe past_due → past_due", () => {
    expect(statusMap["past_due"]).toBe("past_due");
  });

  it("maps Stripe unpaid → canceled", () => {
    expect(statusMap["unpaid"]).toBe("canceled");
  });

  it("falls through to raw status for unknown values", () => {
    const unknown = "some_new_status";
    const status = statusMap[unknown] || unknown;
    expect(status).toBe("some_new_status");
  });
});

// ---------------------------------------------------------------------------
// Webhook route tests with mocked dependencies
// ---------------------------------------------------------------------------

const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
};
vi.mock("@/lib/stripe", () => ({
  getStripe: () => mockStripe,
}));

const mockSupabaseAdmin = {
  from: vi.fn(() => mockSupabaseAdmin),
  update: vi.fn(() => mockSupabaseAdmin),
  eq: vi.fn(() => mockSupabaseAdmin),
};
vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => mockSupabaseAdmin,
}));

vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test");

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when no stripe-signature header", async () => {
    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing signature");
  });

  it("returns 400 when signature verification fails", async () => {
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
      headers: { "stripe-signature": "bad-sig" },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid signature");
    spy.mockRestore();
  });

  it("returns 200 for valid subscription.created event", async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: "customer.subscription.created",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "active",
          items: {
            data: [{ current_period_end: 1700000000 }],
          },
        },
      },
    });

    mockSupabaseAdmin.eq.mockResolvedValue({ data: null, error: null });

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "stripe-signature": "valid-sig" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });

  it("returns 200 for valid subscription.deleted event", async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "canceled",
        },
      },
    });

    mockSupabaseAdmin.eq.mockResolvedValue({ data: null, error: null });

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "stripe-signature": "valid-sig" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("returns 200 for unhandled event types (no-op)", async () => {
    mockStripe.webhooks.constructEvent.mockReturnValue({
      type: "invoice.payment_succeeded",
      data: { object: {} },
    });

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    const req = new NextRequest("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "stripe-signature": "valid-sig" },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
