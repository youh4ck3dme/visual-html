import type { GenerationOptions } from "@/types/generation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useT } from "@/hooks/use-t";
import type { MessageKey } from "@/lib/i18n/messages";

const OUTPUT_OPTIONS: { value: GenerationOptions["outputMode"]; labelKey: MessageKey }[] = [
  { value: "static", labelKey: "options.output.static" },
  { value: "single-file", labelKey: "options.output.singleFile" },
  { value: "tailwind", labelKey: "options.output.tailwind" },
  { value: "component", labelKey: "options.output.component" },
];

const STYLING_OPTIONS: { value: GenerationOptions["stylingMode"]; labelKey: MessageKey }[] = [
  { value: "vanilla-css", labelKey: "options.styling.vanillaCss" },
  { value: "css-modules", labelKey: "options.styling.cssModules" },
  { value: "tailwind", labelKey: "options.styling.tailwind" },
  { value: "inline-css", labelKey: "options.styling.inlineCss" },
];

const RESPONSIVENESS_OPTIONS: {
  value: GenerationOptions["responsiveness"];
  labelKey: MessageKey;
}[] = [
  { value: "mobile-first", labelKey: "options.responsiveness.mobileFirst" },
  { value: "desktop-first", labelKey: "options.responsiveness.desktopFirst" },
  { value: "adaptive", labelKey: "options.responsiveness.adaptive" },
];

const ACCESSIBILITY_OPTIONS: {
  value: GenerationOptions["accessibilityLevel"];
  labelKey: MessageKey;
}[] = [
  { value: "standard", labelKey: "options.accessibility.standard" },
  { value: "strict", labelKey: "options.accessibility.strict" },
];

export function GenerationOptionsPanel({
  value,
  onChange,
  disabled,
}: {
  value: GenerationOptions;
  onChange: (v: GenerationOptions) => void;
  disabled?: boolean;
}) {
  const { t } = useT();
  const set = <K extends keyof GenerationOptions>(k: K, v: GenerationOptions[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="generation-output-mode" className="text-xs text-muted-foreground">
            {t("options.output.label")}
          </Label>
          <Select
            name="outputMode"
            disabled={disabled}
            value={value.outputMode}
            onValueChange={(v) => set("outputMode", v as GenerationOptions["outputMode"])}
          >
            <SelectTrigger id="generation-output-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OUTPUT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="generation-styling-mode" className="text-xs text-muted-foreground">
            {t("options.styling.label")}
          </Label>
          <Select
            name="stylingMode"
            disabled={disabled}
            value={value.stylingMode}
            onValueChange={(v) => set("stylingMode", v as GenerationOptions["stylingMode"])}
          >
            <SelectTrigger id="generation-styling-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STYLING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="generation-responsiveness" className="text-xs text-muted-foreground">
            {t("options.responsiveness.label")}
          </Label>
          <Select
            name="responsiveness"
            disabled={disabled}
            value={value.responsiveness}
            onValueChange={(v) => set("responsiveness", v as GenerationOptions["responsiveness"])}
          >
            <SelectTrigger id="generation-responsiveness">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RESPONSIVENESS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="generation-accessibility-level" className="text-xs text-muted-foreground">
            {t("options.accessibility.label")}
          </Label>
          <Select
            name="accessibilityLevel"
            disabled={disabled}
            value={value.accessibilityLevel}
            onValueChange={(v) =>
              set("accessibilityLevel", v as GenerationOptions["accessibilityLevel"])
            }
          >
            <SelectTrigger id="generation-accessibility-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCESSIBILITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {t(opt.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="generation-extra-instructions" className="text-xs text-muted-foreground">
          {t("options.extraInstructions.label")}
        </Label>
        <Textarea
          id="generation-extra-instructions"
          name="additionalInstructions"
          disabled={disabled}
          maxLength={2000}
          rows={3}
          value={value.additionalInstructions ?? ""}
          onChange={(e) => set("additionalInstructions", e.target.value)}
          placeholder={t("options.extraInstructions.placeholder")}
        />
      </div>
    </div>
  );
}
