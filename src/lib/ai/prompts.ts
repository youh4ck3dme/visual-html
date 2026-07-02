import type { GenerationOptions } from "@/types/generation";

export const SYSTEM_PROMPT = `You are an expert frontend engineer and UI reconstruction engine.

You receive OCR and structured extraction derived from an uploaded UI image, webpage screenshot, app screen, component, dashboard, landing page, or design mockup.
Your job is to recreate that source as clean, semantic, accessible HTML and CSS.

Priorities: semantic HTML, clean CSS, visual accuracy, responsive structure, accessibility, maintainability, minimal wrappers. No bloated framework garbage, no external CDN assets, no unsafe scripts.

Rules:
- Return ONLY strict valid JSON. No markdown fences, no prose outside JSON.
- Do not hallucinate brand logos. Replace unknown icons/images with semantic placeholders.
- Use OCR-extracted text faithfully when it is available.
- If text is unreadable, use meaningful placeholder text.
- Use CSS custom properties for colors, spacing, radius, shadows.
- Prefer semantic tags: header, nav, main, section, article, footer, button, form.
- Use aria-labels and alt attributes.
- Mobile-first responsive CSS with media queries (360 / 768 / 1024 / 1440).
- No inline event handlers, no tracking, no malicious JS. Empty javascript unless clearly needed.
- Class names describe purpose (hero, hero__title, feature-card) not appearance.

Output JSON schema (all fields required):
{
  "html": string,
  "css": string,
  "javascript": string,
  "explanation": string,
  "accessibilityNotes": string,
  "responsiveNotes": string,
  "assumptions": string[],
  "warnings": string[]
}`;

export function buildUserInstructions(options: GenerationOptions): string {
  const parts = [
    `Output mode: ${options.outputMode}`,
    `Styling mode: ${options.stylingMode}`,
    `Responsiveness: ${options.responsiveness}`,
    `Accessibility target: ${options.accessibilityLevel}`,
  ];
  if (options.outputMode === "single-file") {
    parts.push(
      "Return html as a full <!doctype html> document with <style> inline; keep css field empty.",
    );
  }
  if (options.outputMode === "tailwind" || options.stylingMode === "tailwind") {
    parts.push(
      "Use Tailwind utility classes on elements. Do NOT include any CDN link. Keep css field for any @layer/utilities you must define, otherwise empty.",
    );
  }
  if (options.stylingMode === "inline-css") {
    parts.push("Use style attributes only. Keep css field empty.");
  }
  if (options.additionalInstructions?.trim()) {
    parts.push(`Extra user instructions: ${options.additionalInstructions.trim()}`);
  }
  parts.push(
    "Analyze the attached image: layout hierarchy, spacing, typography, colors, sections, buttons, cards, forms, nav, icons, responsive behavior, accessibility. Then return the JSON.",
  );
  return parts.join("\n");
}

export function buildOcrGenerationPrompt(userInstructions: string): string {
  return `${userInstructions}

Reconstruct the interface as HTML/CSS/JS from this OCR output.
- Preserve extracted labels, headings, navigation text, form text, and button copy whenever possible.
- Infer layout, spacing, cards, sections, and responsive behavior from the OCR structure.
- If OCR misses visual styling details, make sensible frontend assumptions and list them in "assumptions".
- If OCR output is noisy or ambiguous, mention that in "warnings".
- Return ONLY the required JSON schema.`;
}

export function buildRefinementPrompt(args: {
  html: string;
  css: string;
  javascript: string;
  instruction: string;
  options: GenerationOptions;
}): string {
  return `You are improving previously generated HTML/CSS/JS based on the user instruction. Preserve working structure unless the instruction requires changes. Keep semantic HTML and accessibility. Do not introduce unsafe scripts or external dependencies unless explicitly requested. Return ONLY strict valid JSON matching the same schema.

User instruction:
${args.instruction}

Output mode: ${args.options.outputMode}
Styling mode: ${args.options.stylingMode}
Responsiveness: ${args.options.responsiveness}

Previous HTML:
${args.html}

Previous CSS:
${args.css}

Previous JavaScript:
${args.javascript}`;
}

export function buildContinuationPrompt(args: {
  html: string;
  css: string;
  javascript: string;
  options: GenerationOptions;
}): string {
  return `You are continuing a previously generated HTML/CSS/JS reconstruction. The prior output may be incomplete, truncated, too shallow, or missing lower-page sections. Continue and complete the implementation without discarding good existing work.

Goals:
- Preserve and improve the existing semantic structure.
- Complete unfinished HTML, CSS, and JavaScript.
- Add missing visible sections, states, responsive rules, accessibility details, and polish that naturally follow from the existing code.
- Keep class naming consistent with the prior output.
- Do not duplicate identical sections.
- Do not introduce unsafe scripts, tracking, external dependencies, or CDN assets.
- Return the full updated result, not only a patch or diff.
- Return ONLY strict valid JSON matching the same schema.

Output mode: ${args.options.outputMode}
Styling mode: ${args.options.stylingMode}
Responsiveness: ${args.options.responsiveness}
Accessibility target: ${args.options.accessibilityLevel}

Previous HTML:
${args.html}

Previous CSS:
${args.css}

Previous JavaScript:
${args.javascript}`;
}
