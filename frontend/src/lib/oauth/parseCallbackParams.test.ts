import { describe, expect, it } from "vitest";
import { parseOAuthCallbackParams } from "./parseCallbackParams";

describe("parseOAuthCallbackParams", () => {
  it("parses code and state from search string", () => {
    const result = parseOAuthCallbackParams(
      "?code=abc123&state=signed.state.value",
    );
    expect(result.code).toBe("abc123");
    expect(result.state).toBe("signed.state.value");
    expect(result.error).toBeNull();
  });

  it("parses provider error query params", () => {
    const result = parseOAuthCallbackParams(
      "?error=access_denied&error_description=User%20denied",
    );
    expect(result.code).toBeNull();
    expect(result.error).toBe("access_denied");
    expect(result.errorDescription).toBe("User denied");
  });
});
