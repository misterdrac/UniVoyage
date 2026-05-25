import { describe, expect, it } from "vitest";
import { mapOAuthError } from "./mapOAuthError";

describe("mapOAuthError", () => {
  it("maps access_denied to user-safe copy", () => {
    expect(mapOAuthError("google", { providerError: "access_denied" })).toMatch(
      /cancelled/i,
    );
  });

  it("maps invalid OAuth state without leaking internals", () => {
    const msg = mapOAuthError("google", {
      backendError: "Invalid or expired OAuth state",
    });
    expect(msg).toMatch(/expired|interrupted/i);
    expect(msg).not.toMatch(/signed|subject|internal/i);
  });

  it("maps missing code", () => {
    expect(
      mapOAuthError("github", { backendError: "Missing authorization code" }),
    ).toMatch(/didn't finish/i);
  });
});
