import { useServerFn } from "@tanstack/react-start";
import { Key, Shield, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { BuilderOrchestrationModeSelect } from "@/components/builder/builder-orchestration-mode-select";
import { BuilderQualityProfileSelect } from "@/components/builder/builder-quality-profile-select";
import { GenerationOptionsPanel } from "@/components/pngto/generation-options";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/hooks/use-t";
import { builderAiStatus } from "@/lib/builder.functions";
import {
  clearBuilderSettings,
  getBuilderMistralKeys,
  getBuilderMistralModel,
  hasBuilderAiAccess,
  saveBuilderSettings,
} from "@/lib/builder/generate";
import {
  getBuilderOrchestrationMode,
  saveBuilderOrchestrationMode,
  type BuilderOrchestrationMode,
} from "@/lib/builder/orchestration-mode";
import {
  getBuilderQualityProfileId,
  saveBuilderQualityProfileId,
  type BuilderQualityProfileId,
} from "@/lib/builder/quality-profiles";
import { loadGenerationDefaults, saveGenerationDefaults } from "@/lib/generation-defaults";
import type { GenerationOptions } from "@/types/generation";

import { useSettingsDialog } from "./settings-context";

export function SettingsDialog() {
  const { t, locale } = useT();
  const { open, setOpen } = useSettingsDialog();
  const statusFn = useServerFn(builderAiStatus);

  const [generationDefaults, setGenerationDefaults] = useState<GenerationOptions>(() =>
    loadGenerationDefaults(locale),
  );
  const [hasByokAccess, setHasByokAccess] = useState(false);
  const [serverAiConfigured, setServerAiConfigured] = useState(false);
  const [key1, setKey1] = useState("");
  const [key2, setKey2] = useState("");
  const [model, setModel] = useState("mistral-large-latest");
  const [orchestrationMode, setOrchestrationMode] = useState<BuilderOrchestrationMode>("pro");
  const [qualityProfileId, setQualityProfileId] = useState<BuilderQualityProfileId>("auto");
  const [showKeys, setShowKeys] = useState(false);

  const hydrateSettings = useCallback(() => {
    const keys = getBuilderMistralKeys();
    setKey1(keys[0] || "");
    setKey2(keys[1] || "");
    setModel(getBuilderMistralModel());
    setOrchestrationMode(getBuilderOrchestrationMode());
    setQualityProfileId(getBuilderQualityProfileId());
    setHasByokAccess(hasBuilderAiAccess());
    setGenerationDefaults(loadGenerationDefaults(locale));
  }, [locale]);

  useEffect(() => {
    if (!open) return;
    hydrateSettings();
    void statusFn()
      .then((status) => setServerAiConfigured(status.serverKeysConfigured))
      .catch(() => setServerAiConfigured(false));
  }, [open, hydrateSettings, statusFn]);

  const handleSave = () => {
    saveGenerationDefaults(generationDefaults);

    if (key1.trim()) {
      saveBuilderSettings({ key1, key2, model });
      setHasByokAccess(hasBuilderAiAccess());
    }

    saveBuilderOrchestrationMode(orchestrationMode);
    saveBuilderQualityProfileId(qualityProfileId);
    setOpen(false);
    toast.success(t("app.settings.saveSuccess"));
  };

  const handleClearKeys = () => {
    clearBuilderSettings();
    setKey1("");
    setKey2("");
    setHasByokAccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto border-shell-border bg-shell-elevated sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("app.settings.title")}</DialogTitle>
          <DialogDescription>{t("app.settings.description")}</DialogDescription>
        </DialogHeader>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-shell-muted">
            {t("app.settings.generationSection")}
          </h3>
          <GenerationOptionsPanel value={generationDefaults} onChange={setGenerationDefaults} />
        </section>

        <section className="space-y-3 border-t border-shell-border pt-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4 text-primary" aria-hidden />
            {t("builder.settings.title")}
          </DialogTitle>
          <DialogDescription>{t("builder.settings.description")}</DialogDescription>

          <div className="rounded-lg border border-shell-border bg-shell px-3 py-2 text-[11px] text-shell-muted">
            {serverAiConfigured
              ? hasByokAccess
                ? t("builder.settings.statusServerWithByok")
                : t("builder.settings.statusServer")
              : hasByokAccess
                ? t("builder.settings.statusByok")
                : t("builder.settings.statusDemo")}
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="settings-k1">{t("builder.settings.key1")}</Label>
              <Input
                id="settings-k1"
                type={showKeys ? "text" : "password"}
                value={key1}
                onChange={(e) => setKey1(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-k2">{t("builder.settings.key2")}</Label>
              <Input
                id="settings-k2"
                type={showKeys ? "text" : "password"}
                value={key2}
                onChange={(e) => setKey2(e.target.value)}
              />
              <p className="flex items-center gap-1 text-[11px] text-shell-muted">
                <Shield className="h-3 w-3" aria-hidden />
                {t("builder.settings.key2Hint")}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-model">{t("builder.settings.model")}</Label>
              <select
                id="settings-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="h-9 w-full rounded-md border border-shell-border bg-shell px-3 text-sm"
              >
                <option value="mistral-large-latest">{t("builder.settings.modelLarge")}</option>
                <option value="mistral-medium-latest">{t("builder.settings.modelMedium")}</option>
                <option value="codestral-latest">{t("builder.settings.modelCodestral")}</option>
              </select>
            </div>
            <BuilderOrchestrationModeSelect
              value={orchestrationMode}
              onChange={setOrchestrationMode}
            />
            <BuilderQualityProfileSelect
              value={qualityProfileId}
              orchestrationMode={orchestrationMode}
              onChange={setQualityProfileId}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowKeys((v) => !v)}
            >
              {showKeys ? t("builder.settings.hideKeys") : t("builder.settings.showKeys")}{" "}
              {t("builder.settings.keysSuffix")}
            </Button>
          </div>
        </section>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="secondary" size="icon" onClick={handleClearKeys}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            {t("builder.settings.cancel")}
          </Button>
          <Button type="button" onClick={handleSave} data-testid="app-settings-save">
            {t("builder.settings.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
