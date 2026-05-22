import { afterEach, describe, expect, it, vi } from "vitest";
import { safeAuthError } from "./safeAuthLog";

describe("safeAuthError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redacts JWT and query secrets from log output", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature";
    safeAuthError("OAuth failed", {
      url: `https://app/auth/callback?code=secret-code&state=signed`,
      token: jwt,
      otp: "123456",
    });

    const logged = spy.mock.calls.flat().join(" ");
    expect(logged).not.toContain("secret-code");
    expect(logged).not.toContain(jwt);
    expect(logged).not.toContain("123456");
    expect(logged).toContain("[redacted]");
  });
});
