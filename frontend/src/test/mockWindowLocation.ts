import { vi } from "vitest";

export type MockLocation = Location & {
  assign: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  reload: ReturnType<typeof vi.fn>;
};

/**
 * Replaces `window.location` for OAuth callback E2E (page reads `search` directly).
 */
export function mockWindowLocation(
  overrides: Partial<MockLocation> = {},
): MockLocation {
  const base: MockLocation = {
    href: "http://localhost:5173/auth/google/callback",
    origin: "http://localhost:5173",
    protocol: "http:",
    host: "localhost:5173",
    hostname: "localhost",
    port: "5173",
    pathname: "/auth/google/callback",
    search: "",
    hash: "",
    ancestorOrigins: [] as unknown as DOMStringList,
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    toString() {
      return this.href;
    },
    ...overrides,
  };

  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: base,
  });

  return base;
}
