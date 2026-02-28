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
  billingPortal: { sessions: { create: vi.fn() } },
};
vi.mock("@/lib/stripe", () => ({
  getStripe: () => mockStripe,
}));

const mockSupabaseAdmin = {
  from: vi.fn(() => mockSupabaseAdmin),
  select: vi.fn(() => mockSupabaseAdmin),
  eq: vi.fn(() => mockSupabaseAdmin),
  single: vi.fn(),
};
vi.mock("@/lib/supabase-admin", () => ({
  getSupabaseAdmin: () => mockSupabaseAdmin,
}));

vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");

describe("POST /api/portal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no authorization header", async () => {
    const { POST } = await import("@/app/api/portal/route");
    const req = new NextRequest("http://localhost:3000/api/portal", {
      method: "POST",
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 for invalid Bearer token", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    (createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "bad token" },
        }),
      },
    });

    const { POST } = await import("@/app/api/portal/route");
    const req = new NextRequest("http://localhost:3000/api/portal", {
      method: "POST",
      headers: { authorization: "Bearer bad-token" },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 404 when user has no stripe customer id", async () => {
    const { createClient } = await import("@supabase/supabase-js");
    (createClient as ReturnType<typeof vi.fn>).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-123", email: "test@example.com" } },
          error: null,
        }),
      },
    });

    mockSupabaseAdmin.single.mockResolvedValue({
      data: null,
      error: null,
    });

    const { POST } = await import("@/app/api/portal/route");
    const req = new NextRequest("http://localhost:3000/api/portal", {
      method: "POST",
      headers: { authorization: "Bearer valid-token" },
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });
});
