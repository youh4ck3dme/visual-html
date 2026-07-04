import { describe, expect, it } from "vitest";

import { getElectronAPI, isElectronDesktop, saveElectronProject } from "@/lib/electron-api";

describe("electron-api", () => {
  it("detects browser mode when electron bridge is absent", () => {
    expect(isElectronDesktop()).toBe(false);
    expect(getElectronAPI()).toBeNull();
  });

  it("returns null when saving outside Electron", async () => {
    await expect(saveElectronProject({ name: "Demo" })).resolves.toBeNull();
  });
});
