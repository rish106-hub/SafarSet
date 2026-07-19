import { describe, expect, it } from "vitest";
import { familySafeStarterPolicy, readStarterPolicy } from "@/features/policy/starter-policy";

describe("starter policy", () => {
  it("accepts a valid local draft", () => { expect(readStarterPolicy(JSON.stringify(familySafeStarterPolicy))).toEqual(familySafeStarterPolicy); });
  it("rejects unsafe or malformed values", () => { expect(readStarterPolicy('{"maxStops":99}')).toBeNull(); expect(readStarterPolicy("not-json")).toBeNull(); });
});
