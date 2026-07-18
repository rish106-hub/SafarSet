import { describe, expect, it } from "vitest";

import {
  formatTime,
  fromDateTimeLocal,
  toDateTimeLocal,
} from "@/lib/format";

describe("date formatting", () => {
  it("returns a safe label for invalid dates", () => {
    expect(formatTime("")).toBe("Time unavailable");
    expect(formatTime("not-a-date")).toBe("Time unavailable");
  });

  it("round-trips UTC storage through a local datetime input", () => {
    const stored = "2026-08-16T14:30:00.000Z";
    expect(fromDateTimeLocal(toDateTimeLocal(stored))).toBe(stored);
  });
});
