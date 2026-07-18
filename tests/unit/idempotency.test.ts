import { createIdempotencyKey } from "@/engine";
import { describe, expect, it } from "vitest";

describe("createIdempotencyKey", () => {
  it("returns stable 64-bit hex", () => {
    const key = createIdempotencyKey("trip", "disruption", "itinerary");
    expect(key).toMatch(/^[0-9a-f]{16}$/);
    expect(createIdempotencyKey("trip", "disruption", "itinerary")).toBe(key);
  });

  it("separates length-prefixed inputs", () => {
    expect(createIdempotencyKey("ab", "c", "d")).not.toBe(
      createIdempotencyKey("a", "bc", "d"),
    );
  });
});
