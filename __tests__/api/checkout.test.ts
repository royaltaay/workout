import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Mock external dependencies
// ---------------------------------------------------------------------------

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

const mockStripe = {
  customers: { create: vi.fn() },
  checkout: { sessions: { create: vi.fn() } },
};
vi.mock("@/lib/stripe", () => ({
  getStripe: () => mockStripe,
}));

const mockSupabaseAdmin = {
  from: vi.fn(() => mockSupabaseAdmin),
  select: vi.fn(() => mockSupabaseAdmin),
  eq: vi.fn(() => mockSupabaseAdmin),
  single: vi.fn(),
  upsert: vi.fn(() => mockSupabaseAdmin),
};
vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => mockSupabaseAdmin,
}));

// Set required env vars
vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
vi.stubEnv("STRIPE_PRICE_ID", "price_test");
vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no authorization header", async () => {
    const { POST } = await import("@/app/api/checkout/route");
    const req = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when authorization header has wrong format", async () => {
    const { POST } = await import("@/app/api/checkout/route");
    const req = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: { authorization: "Basic abc123" },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when token is invalid", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    (createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Invalid token" },
        }),
      },
    });

    const { POST } = await import("@/app/api/checkout/route");
    const req = new NextRequest("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: { authorization: "Bearer invalid-token" },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
