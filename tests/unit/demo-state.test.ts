import {
  initialDemoState,
  parseDemoState,
} from "@/features/demo/state";
import { describe, expect, it } from "vitest";

describe("demo browser state", () => {
  it("falls back for empty or corrupt storage", () => {
    expect(parseDemoState(null)).toEqual(initialDemoState);
    expect(parseDemoState("not-json")).toEqual(initialDemoState);
    expect(parseDemoState(JSON.stringify({ version: 2 }))).toEqual(
      initialDemoState,
    );
    expect(
      parseDemoState(
        JSON.stringify({
          ...initialDemoState,
          view: "unknown-view",
          policy: {},
        }),
      ),
    ).toEqual(initialDemoState);
  });

  it("restores valid versioned state", () => {
    const recovered = {
      ...initialDemoState,
      view: "trip" as const,
      phase: "disrupted" as const,
    };

    expect(parseDemoState(JSON.stringify(recovered))).toEqual(recovered);
  });
});
