export const BUILDER_ORCHESTRATION_MODES = ["fast", "pro", "beast"] as const;

export type BuilderOrchestrationMode = (typeof BUILDER_ORCHESTRATION_MODES)[number];

export const DEFAULT_BUILDER_ORCHESTRATION_MODE: BuilderOrchestrationMode = "pro";

const STORAGE_KEY = "visual-html.builder.orchestrationMode";
const LEGACY_STORAGE_KEY = "builder_orchestration_mode";
const BEAST_CONFIRMED_KEY = "visual-html.builder.beastConfirmed";

export const BUILDER_ORCHESTRATION_MODE_EVENT = "builder-orchestration-mode-change";

export function isBuilderOrchestrationMode(value: unknown): value is BuilderOrchestrationMode {
  return (
    typeof value === "string" &&
    BUILDER_ORCHESTRATION_MODES.includes(value as BuilderOrchestrationMode)
  );
}

function readStoredMode(): BuilderOrchestrationMode | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isBuilderOrchestrationMode(stored)) return stored;

    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (isBuilderOrchestrationMode(legacy)) {
      window.localStorage.setItem(STORAGE_KEY, legacy);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return legacy;
    }
  } catch {
    return null;
  }

  return null;
}

export function getBuilderOrchestrationMode(): BuilderOrchestrationMode {
  return readStoredMode() ?? DEFAULT_BUILDER_ORCHESTRATION_MODE;
}

export function hasBeastModeBeenConfirmed(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return window.localStorage.getItem(BEAST_CONFIRMED_KEY) === "1";
  } catch {
    return false;
  }
}

export function confirmBeastMode(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(BEAST_CONFIRMED_KEY, "1");
  } catch {
    // ignore restricted storage
  }
}

export function saveBuilderOrchestrationMode(mode: BuilderOrchestrationMode): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(BUILDER_ORCHESTRATION_MODE_EVENT, {
        detail: mode,
      }),
    );
  } catch {
    // localStorage can fail in private mode / restricted browser contexts.
  }
}

export const BUILDER_ORCHESTRATION_MODE_META: Record<
  BuilderOrchestrationMode,
  {
    labelKey: `builder.settings.orchestration.${BuilderOrchestrationMode}.label`;
    badgeKey: `builder.settings.orchestration.${BuilderOrchestrationMode}.badge`;
    descriptionKey: `builder.settings.orchestration.${BuilderOrchestrationMode}.description`;
    callsKey: `builder.settings.orchestration.${BuilderOrchestrationMode}.calls`;
    warningKey?: "builder.settings.orchestration.beast.warning";
  }
> = {
  fast: {
    labelKey: "builder.settings.orchestration.fast.label",
    badgeKey: "builder.settings.orchestration.fast.badge",
    descriptionKey: "builder.settings.orchestration.fast.description",
    callsKey: "builder.settings.orchestration.fast.calls",
  },
  pro: {
    labelKey: "builder.settings.orchestration.pro.label",
    badgeKey: "builder.settings.orchestration.pro.badge",
    descriptionKey: "builder.settings.orchestration.pro.description",
    callsKey: "builder.settings.orchestration.pro.calls",
  },
  beast: {
    labelKey: "builder.settings.orchestration.beast.label",
    badgeKey: "builder.settings.orchestration.beast.badge",
    descriptionKey: "builder.settings.orchestration.beast.description",
    callsKey: "builder.settings.orchestration.beast.calls",
    warningKey: "builder.settings.orchestration.beast.warning",
  },
};
