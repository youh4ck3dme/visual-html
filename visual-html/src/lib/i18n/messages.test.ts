import { describe, expect, it } from "vitest";

import { messages } from "@/lib/i18n/messages";

describe("i18n messages parity", () => {
  it("EN and SK have identical key sets", () => {
    const enKeys = Object.keys(messages.en).sort();
    const skKeys = Object.keys(messages.sk).sort();
    expect(skKeys).toEqual(enKeys);

    const missingInSk = enKeys.filter((k) => !(k in messages.sk));
    const missingInEn = skKeys.filter((k) => !(k in messages.en));
    expect(missingInSk).toEqual([]);
    expect(missingInEn).toEqual([]);
  });
});
