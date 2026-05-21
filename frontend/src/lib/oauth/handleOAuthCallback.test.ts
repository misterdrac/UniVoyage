import { describe, expect, it, vi, beforeEach } from "vitest";
import { handleOAuthCallback } from "./handleOAuthCallback";

vi.mock("@/services/api", () => ({
  apiService: {
    oauthCallback: vi.fn(),
  },
}));

import { apiService } from "@/services/api";

describe("handleOAuthCallback", () => {
  beforeEach(() => {
    vi.mocked(apiService.oauthCallback).mockReset();
  });

  it("returns failure for provider access_denied without calling backend", async () => {
    const result = await handleOAuthCallback("google", "?error=access_denied");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/cancelled/i);
    }
    expect(apiService.oauthCallback).not.toHaveBeenCalled();
  });

  it("exchanges code and state with backend", async () => {
    vi.mocked(apiService.oauthCallback).mockResolvedValue({
      success: true,
      user: {
        id: 1,
        name: "T",
        email: "t@example.com",
        role: "USER",
        hobbies: [],
        languages: [],
        visitedCountries: [],
      },
    });

    const result = await handleOAuthCallback(
      "google",
      "?code=the-code&state=the-state",
    );

    expect(result.success).toBe(true);
    expect(apiService.oauthCallback).toHaveBeenCalledWith(
      "google",
      "the-code",
      "the-state",
    );
  });
});
