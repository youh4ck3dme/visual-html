import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BuilderOrchestrationError,
  clearBuilderSettings,
  enrichBuildPrompt,
  generateBuilderCode,
  isAbortError,
  saveBuilderSettings,
} from "@/lib/builder/generate";
import { saveBuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";
import { saveBuilderQualityProfileId } from "@/lib/builder/quality-profiles";

const VALID_HTML = `<!DOCTYPE html><html lang="en"><head><title>AI</title></head><body><h1>Real AI</h1></body></html>`;

describe("builder generate", () => {
  beforeEach(() => {
    localStorage.clear();
    saveBuilderOrchestrationMode("fast");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearBuilderSettings();
  });

  it("enriches starter template prompts with concrete requirements", () => {
    const enriched = enrichBuildPrompt("short", "wordpress-landing");
    expect(enriched).toContain("WordPress-style marketing landing page");
    expect(enriched).toContain("WordPress Marketing Landing");
    expect(enriched).toContain("Visual quality requirements");
    expect(enriched).not.toBe("short");
  });

  it("does not pass AbortSignal in server chat RPC payload", async () => {
    const serverChat = vi.fn().mockResolvedValue({ ok: true, content: VALID_HTML });
    const controller = new AbortController();

    await generateBuilderCode(
      "Build a planner test page",
      vi.fn(),
      serverChat,
      undefined,
      "build",
      undefined,
      {
        orchestrationMode: "pro",
        preferServerAi: true,
        signal: controller.signal,
      },
    );

    expect(serverChat).toHaveBeenCalled();
    for (const call of serverChat.mock.calls) {
      expect(call[0]).not.toHaveProperty("signal");
    }
  });

  it("does not override explicit orchestration mode with profile recommendation", async () => {
    saveBuilderOrchestrationMode("fast");
    saveBuilderQualityProfileId("neon-parallax");
    const serverChat = vi.fn().mockResolvedValue({ ok: true, content: VALID_HTML });

    await generateBuilderCode(
      "Build a neon parallax hero",
      vi.fn(),
      serverChat,
      undefined,
      "build",
      undefined,
      {
        orchestrationMode: "fast",
        qualityProfileId: "neon-parallax",
      },
    );

    expect(serverChat).toHaveBeenCalledOnce();
  });

  it("uses explicit orchestrationMode over localStorage", async () => {
    saveBuilderOrchestrationMode("pro");
    const serverChat = vi.fn().mockResolvedValue({ ok: true, content: VALID_HTML });

    await generateBuilderCode(
      "Build a simple card",
      vi.fn(),
      serverChat,
      undefined,
      "build",
      undefined,
      {
        orchestrationMode: "fast",
      },
    );

    expect(serverChat).toHaveBeenCalledOnce();
  });

  it("aborts in-flight generation when signal is aborted", async () => {
    saveBuilderSettings({ key1: "test-key", key2: "", model: "mistral-large-latest" });
    const controller = new AbortController();
    const serverChat = vi.fn(
      () =>
        new Promise<{ ok: true; content: string }>(() => {
          // never resolves
        }),
    );

    const promise = generateBuilderCode(
      "Build a card",
      vi.fn(),
      serverChat,
      undefined,
      "build",
      undefined,
      { orchestrationMode: "fast", signal: controller.signal },
    );

    controller.abort();
    await expect(promise).rejects.toSatisfy((error: unknown) => isAbortError(error));
  });

  it("surfaces planning step failures in pro mode", async () => {
    saveBuilderSettings({ key1: "test-key", key2: "", model: "mistral-large-latest" });
    const serverChat = vi.fn().mockResolvedValue({ ok: false, message: "planner boom" });

    await expect(
      generateBuilderCode(
        "Build a landing page",
        vi.fn(),
        serverChat,
        undefined,
        "build",
        undefined,
        {
          orchestrationMode: "pro",
          preferServerAi: true,
        },
      ),
    ).rejects.toMatchObject({
      name: "BuilderOrchestrationError",
      step: "planning",
      mode: "pro",
      message: "planner boom",
    });
  });

  it("runs pro orchestration with planner, builder, and reviewer lanes", async () => {
    const serverChat = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, content: '{"mode":"build","intent":"demo"}' })
      .mockResolvedValueOnce({ ok: true, content: VALID_HTML })
      .mockResolvedValueOnce({ ok: true, content: VALID_HTML });

    const result = await generateBuilderCode(
      "Build a neon parallax showcase",
      vi.fn(),
      serverChat,
      undefined,
      "build",
      undefined,
      { orchestrationMode: "pro" },
    );

    expect(serverChat).toHaveBeenCalledTimes(3);
    expect(serverChat.mock.calls[0]?.[0]).toMatchObject({
      keySlot: "primary",
      jsonMode: true,
    });
    expect(serverChat.mock.calls[1]?.[0]).toMatchObject({
      keySlot: "secondary",
    });
    expect(serverChat.mock.calls[2]?.[0]).toMatchObject({
      keySlot: "primary",
    });
    expect(result.via).toBe("ai");
    expect(result.content).toContain("Real AI");
  });

  it("falls back to offline demo only when no BYOK keys and server fails", async () => {
    const steps: Array<[number, string]> = [];
    const result = await generateBuilderCode(
      "snake game",
      (step, status) => steps.push([step, status]),
      async () => ({ ok: false, message: "missing server key" }),
      undefined,
      "build",
    );

    expect(result.type).toBe("code");
    expect(result.via).toBe("offline");
    expect(result.content.toLowerCase()).toContain("snake");
    expect(steps.some(([, status]) => status === "Loading offline template...")).toBe(true);
  });

  it("does not fall back to demo when BYOK keys are configured", async () => {
    saveBuilderSettings({ key1: "test-key", key2: "", model: "mistral-large-latest" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({ message: "Unauthorized" }),
      }),
    );

    await expect(
      generateBuilderCode(
        "Build a WordPress landing page",
        vi.fn(),
        async () => ({ ok: false, message: "server also failed" }),
        undefined,
        "build",
        "wordpress-landing",
      ),
    ).rejects.toBeInstanceOf(BuilderOrchestrationError);
  });

  it("tries server AI before browser BYOK", async () => {
    saveBuilderSettings({ key1: "bad-key", key2: "", model: "mistral-large-latest" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ message: "Unauthorized" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const serverChat = vi.fn().mockResolvedValue({ ok: true, content: VALID_HTML });
    const result = await generateBuilderCode(
      "Build a WordPress landing page",
      vi.fn(),
      serverChat,
      undefined,
      "build",
      "wordpress-landing",
    );

    expect(serverChat).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.via).toBe("ai");
  });

  it("uses server AI when browser BYOK fails", async () => {
    saveBuilderSettings({ key1: "bad-key", key2: "", model: "mistral-large-latest" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({ message: "Unauthorized" }),
      }),
    );

    const serverChat = vi.fn().mockResolvedValue({ ok: true, content: VALID_HTML });
    const result = await generateBuilderCode(
      "Build a WordPress landing page",
      vi.fn(),
      serverChat,
      undefined,
      "build",
      "wordpress-landing",
    );

    expect(serverChat).toHaveBeenCalledOnce();
    expect(result.type).toBe("code");
    expect(result.via).toBe("ai");
    expect(result.content).toContain("Real AI");
  });

  it("prefers server AI first when server env is configured", async () => {
    saveBuilderSettings({ key1: "browser-key", key2: "", model: "mistral-large-latest" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "<!DOCTYPE html><html><body>Browser</body></html>" } }],
        }),
      }),
    );
    const serverChat = vi.fn().mockResolvedValue({ ok: true, content: VALID_HTML });

    const result = await generateBuilderCode(
      "Build a landing page",
      vi.fn(),
      serverChat,
      undefined,
      "build",
      undefined,
      { preferServerAi: true },
    );

    expect(serverChat).toHaveBeenCalledOnce();
    expect(fetch).not.toHaveBeenCalled();
    expect(result.via).toBe("ai");
    expect(result.content).toContain("Real AI");
  });

  it("sanitizes quoted BYOK keys on save", () => {
    saveBuilderSettings({
      key1: '"sk-test-key"',
      key2: "'backup'",
      model: "mistral-large-latest",
    });
    expect(localStorage.getItem("builder_mistral_api_key_1")).toBe("sk-test-key");
    expect(localStorage.getItem("builder_mistral_api_key_2")).toBe("backup");
  });

  it("falls back to browser BYOK when server AI is unavailable", async () => {
    saveBuilderSettings({ key1: "good-key", key2: "", model: "mistral-large-latest" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: VALID_HTML } }],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const serverChat = vi.fn().mockResolvedValue({ ok: false, message: "no server key" });

    const result = await generateBuilderCode(
      "Build a portfolio",
      vi.fn(),
      serverChat,
      undefined,
      "build",
    );

    expect(serverChat).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.via).toBe("ai");
    expect(result.content).toContain("Real AI");
  });
});
