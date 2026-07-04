"use client";

import { useEffect, useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import { useT } from "@/hooks/use-t";
import type { MessageKey } from "@/lib/i18n/messages";
import {
  BUILDER_ORCHESTRATION_MODE_META,
  type BuilderOrchestrationMode,
} from "@/lib/builder/orchestration-mode";
import {
  BUILDER_QUALITY_PROFILE_EVENT,
  BUILDER_QUALITY_PROFILE_IDS,
  BUILDER_QUALITY_PROFILES,
  getBuilderQualityProfileId,
  resolveBuilderQualityProfile,
  saveBuilderQualityProfileId,
  shouldShowFastModeProfileWarning,
  type BuilderQualityProfileId,
} from "@/lib/builder/quality-profiles";

type BuilderQualityProfileSelectProps = {
  value?: BuilderQualityProfileId;
  orchestrationMode: BuilderOrchestrationMode;
  previewPrompt?: string;
  onChange?: (profileId: BuilderQualityProfileId) => void;
};

export function BuilderQualityProfileSelect({
  value,
  orchestrationMode,
  previewPrompt = "",
  onChange,
}: BuilderQualityProfileSelectProps) {
  const { t } = useT();
  const [profileId, setProfileId] = useState<BuilderQualityProfileId>(value ?? "auto");

  useEffect(() => {
    if (value) {
      setProfileId(value);
      return;
    }
    setProfileId(getBuilderQualityProfileId());
  }, [value]);

  useEffect(() => {
    const syncProfile = (event: Event) => {
      const detail = (event as CustomEvent<BuilderQualityProfileId>).detail;
      if (detail) setProfileId(detail);
    };

    window.addEventListener(BUILDER_QUALITY_PROFILE_EVENT, syncProfile);
    return () => window.removeEventListener(BUILDER_QUALITY_PROFILE_EVENT, syncProfile);
  }, []);

  const selectedProfile = BUILDER_QUALITY_PROFILES[profileId];
  const resolvedProfile = useMemo(
    () => resolveBuilderQualityProfile(profileId, previewPrompt),
    [profileId, previewPrompt],
  );
  const recommendedMeta = BUILDER_ORCHESTRATION_MODE_META[resolvedProfile.recommendedMode];
  const showFastWarning = shouldShowFastModeProfileWarning(resolvedProfile, orchestrationMode);

  function handleChange(nextProfileId: BuilderQualityProfileId) {
    setProfileId(nextProfileId);
    saveBuilderQualityProfileId(nextProfileId);
    onChange?.(nextProfileId);
  }

  return (
    <div className="space-y-2" data-testid="builder-quality-profile-select">
      <Label htmlFor="builder-quality-profile">{t("builder.profile.title")}</Label>

      <select
        id="builder-quality-profile"
        value={profileId}
        onChange={(event) => handleChange(event.target.value as BuilderQualityProfileId)}
        className="h-9 w-full rounded-md border border-shell-border bg-shell px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        data-testid="builder-quality-profile"
      >
        {BUILDER_QUALITY_PROFILE_IDS.map((id) => {
          const profile = BUILDER_QUALITY_PROFILES[id];
          return (
            <option key={id} value={id} className="bg-shell text-shell-foreground">
              {t(profile.labelKey as MessageKey)}
            </option>
          );
        })}
      </select>

      <p
        className="text-[11px] leading-relaxed text-shell-muted"
        data-testid="builder-quality-profile-description"
      >
        {t(selectedProfile.descriptionKey as MessageKey)}
      </p>

      <p
        className="text-[11px] text-primary"
        data-testid="builder-quality-profile-recommended-mode"
      >
        {t("builder.profile.recommendedMode")}: {t(recommendedMeta.labelKey)}
      </p>

      {showFastWarning ? (
        <p
          className="text-[11px] leading-relaxed text-amber-500/90"
          data-testid="builder-quality-profile-fast-warning"
        >
          {t("builder.profile.fastWarning")}
        </p>
      ) : null}
    </div>
  );
}
