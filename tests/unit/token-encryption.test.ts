import { afterEach, describe, expect, it } from "vitest";

import { decryptToken, encryptToken } from "@/lib/security/token-encryption";

const originalKey = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  else process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = originalKey;
});

describe("provider token encryption", () => {
  it("round-trips without exposing plaintext", () => {
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
    const encrypted = encryptToken("refresh-secret");
    expect(encrypted).not.toContain("refresh-secret");
    expect(decryptToken(encrypted)).toBe("refresh-secret");
  });

  it("rejects the wrong encryption key", () => {
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
    const encrypted = encryptToken("refresh-secret");
    process.env.GOOGLE_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 8).toString("base64");
    expect(() => decryptToken(encrypted)).toThrow();
  });
});
