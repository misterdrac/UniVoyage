import { describe, expect, it } from "vitest";
import { APP_VERSION, APP_VERSION_LABEL } from "./version";

describe("APP_VERSION", () => {
  it("matches package.json semver", () => {
    expect(APP_VERSION).toBe("1.0.1");
    expect(APP_VERSION_LABEL).toBe("v1.0.1");
  });
});
