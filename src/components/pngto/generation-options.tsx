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

export function GenerationOptionsPanel({
  value,
  onChange,
  disabled,
}: {
  value: GenerationOptions;
  onChange: (v: GenerationOptions) => void;
  disabled?: boolean;
}) {
  const set = <K extends keyof GenerationOptions>(k: K, v: GenerationOptions[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="generation-output-mode" className="text-xs text-muted-foreground">
            Output
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
              <SelectItem value="static">Static HTML + CSS</SelectItem>
              <SelectItem value="single-file">Single-file HTML</SelectItem>
              <SelectItem value="tailwind">Tailwind</SelectItem>
              <SelectItem value="component">Component-style</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="generation-styling-mode" className="text-xs text-muted-foreground">
            Styling
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
              <SelectItem value="vanilla-css">Vanilla CSS</SelectItem>
              <SelectItem value="css-modules">CSS Modules</SelectItem>
              <SelectItem value="tailwind">Tailwind classes</SelectItem>
              <SelectItem value="inline-css">Inline styles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="generation-responsiveness" className="text-xs text-muted-foreground">
            Responsiveness
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
              <SelectItem value="mobile-first">Mobile-first</SelectItem>
              <SelectItem value="desktop-first">Desktop-first</SelectItem>
              <SelectItem value="adaptive">Adaptive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="generation-accessibility-level" className="text-xs text-muted-foreground">
            Accessibility
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
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="strict">Strict (WCAG AA)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="generation-extra-instructions" className="text-xs text-muted-foreground">
          Extra instructions (optional)
        </Label>
        <Textarea
          id="generation-extra-instructions"
          name="additionalInstructions"
          disabled={disabled}
          maxLength={2000}
          rows={3}
          value={value.additionalInstructions ?? ""}
          onChange={(e) => set("additionalInstructions", e.target.value)}
          placeholder="Customize the generation behavior…"
        />
      </div>
    </div>
  );
}
