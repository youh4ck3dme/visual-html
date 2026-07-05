import { GenerationPipelineCard } from "@/components/editor/generation-pipeline-card";
import { useT } from "@/hooks/use-t";
import { localizedPhaseLabel } from "@/lib/i18n/helpers";
import type { MessageKey } from "@/lib/i18n/messages";
import type { GenerationPhase, GenerationSensor } from "@/types/generation";

const GENERATE_STEP_IDS: GenerationPhase[] = [
  "validating",
  "rate_limited_check",
  "uploading_to_blob",
  "ocr",
  "synthesizing",
  "json_repair",
  "sanitizing",
  "done",
];

function localizedSensorMessage(
  t: (key: MessageKey, params?: Record<string, string | number>) => string,
  sensor: GenerationSensor,
): string {
  if (sensor.phase === "synthesizing") {
    if (sensor.message === "Applying your refinement...") return t("phase.message.refining");
    if (sensor.message === "Continuing code generation...") return t("phase.message.continuing");
  }
  const key = `phase.message.${sensor.phase}` as MessageKey;
  return t(key);
}

function mapSensorStatus(sensor: GenerationSensor): "running" | "success" | "failed" | "idle" {
  if (sensor.status === "failed") return "failed";
  if (sensor.status === "success") return "success";
  if (sensor.status === "running" || sensor.status === "warning") return "running";
  return "idle";
}

export function LoadingSteps({ sensor }: { sensor: GenerationSensor }) {
  const { t, locale } = useT();

  if (sensor.phase === "synthesizing" && sensor.message === "Applying your refinement...") {
    return (
      <GenerationPipelineCard
        title={t("phase.message.refining")}
        progress={sensor.progress}
        steps={[{ id: "refining", label: t("phase.message.refining") }]}
        activeIndex={0}
        status={mapSensorStatus(sensor)}
        progressAriaLabel={t("loading.refinementProgressAria")}
      />
    );
  }

  const activeIndex = GENERATE_STEP_IDS.findIndex((s) => s === sensor.phase);
  const steps = GENERATE_STEP_IDS.map((stepId) => ({
    id: stepId,
    label: t(`loading.step.${stepId}` as MessageKey),
  }));

  return (
    <GenerationPipelineCard
      title={`${localizedPhaseLabel(locale, sensor.phase)} · ${localizedSensorMessage(t, sensor)}`}
      subtitle={t("loading.progressNote")}
      progress={sensor.progress}
      steps={steps}
      activeIndex={activeIndex >= 0 ? activeIndex : 0}
      status={mapSensorStatus(sensor)}
      progressAriaLabel={t("loading.generationProgressAria")}
    />
  );
}
