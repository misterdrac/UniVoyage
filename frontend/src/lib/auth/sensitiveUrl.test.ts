import { describe, expect, it } from "vitest";
import {
  locationHasSensitiveQueryParams,
  readQueryParam,
  stripSensitiveSearchParams,
} from "./sensitiveUrl";

describe("sensitiveUrl", () => {
  it("detects OAuth and email-link params", () => {
    expect(locationHasSensitiveQueryParams("?code=abc&state=xyz")).toBe(true);
    expect(locationHasSensitiveQueryParams("?token=reset-secret")).toBe(true);
    expect(locationHasSensitiveQueryParams("?login=1")).toBe(false);
  });

  it("strips sensitive keys and keeps safe params", () => {
    expect(stripSensitiveSearchParams("?code=1&state=2&login=1")).toBe(
      "?login=1",
    );
    expect(stripSensitiveSearchParams("?token=abc")).toBe("");
  });

  it("reads a single param", () => {
    expect(readQueryParam("?token=  abc  ", "token")).toBe("abc");
  });
});
