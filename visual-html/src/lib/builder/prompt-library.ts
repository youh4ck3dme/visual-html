import { promptCategories, promptLibrary } from "@/lib/builder";
import {
  BUILDER_QUALITY_PROFILES,
  resolveBuilderQualityProfile,
  type BuilderQualityProfile,
  type BuilderQualityProfileId,
} from "@/lib/builder/quality-profiles";

export type { PromptCategory, PromptItem } from "@/lib/builder";
export { promptCategories, promptLibrary };

export const premiumVisualEnhancer = `
Visual quality requirements:
- Make the result premium, modern, cinematic, and visually impressive.
- Use strong composition, depth, spacing, typography, and hierarchy.
- Avoid generic template aesthetics.
- Avoid flat boring cards.
- Use responsive design.
- Add tasteful hover states and transitions.
- Add reduced-motion support if animated.
- Use CSS variables.
- Use semantic HTML where practical.
- Return a complete single-file HTML document.
`;

export const neonParallaxPreset = `
Style preset:
- Futuristic dark interface
- Controlled neon palette
- Glassmorphism
- Layered radial and conic gradients
- Holographic panels
- Atmospheric particles
- Depth-based parallax
- Smooth pointer-reactive motion
- Cinematic lighting
- Premium sci-fi AI product feeling

Technical requirements:
- Use perspective and preserve-3d.
- Use translateZ, rotateX, rotateY, scale, blur, and opacity.
- All floating elements must be position:absolute.
- Smooth pointer movement with requestAnimationFrame.
- Touch devices need ambient fallback motion.
- Respect prefers-reduced-motion.
`;

const neonParallaxKeywords = [
  "neon",
  "parallax",
  "3d",
  "4d",
  "cyberpunk",
  "futuristic",
  "holograph",
  "glass",
  "wow",
  "cinematic",
];

export function wantsNeonParallaxPreset(text: string): boolean {
  const norm = text.toLowerCase();
  return neonParallaxKeywords.some((keyword) => norm.includes(keyword));
}

function shouldAttachPremiumEnhancer(profile: BuilderQualityProfile): boolean {
  return profile.id !== "minimal-clean" && profile.id !== "auto";
}

export function enrichBuildPrompt(
  promptText: string,
  templateId?: string,
  qualityProfile?: BuilderQualityProfile | BuilderQualityProfileId,
  userPromptForAuto?: string,
): string {
  const resolvedProfile =
    typeof qualityProfile === "string"
      ? resolveBuilderQualityProfile(qualityProfile, userPromptForAuto ?? promptText)
      : (qualityProfile ?? BUILDER_QUALITY_PROFILES["premium-saas"]);
  const base = promptText.trim();

  if (!templateId) {
    const parts = [base, resolvedProfile.promptEnhancer.trim()].filter(Boolean);
    return parts.join("\n\n");
  }

  const template = promptLibrary.find((item) => item.id === templateId);
  if (!template) {
    const parts = [base, resolvedProfile.promptEnhancer.trim()].filter(Boolean);
    return parts.join("\n\n");
  }

  const parts = [
    base && !base.toLowerCase().includes(template.title.toLowerCase()) ? base : "",
    template.prompt.trim(),
    `Starter template: "${template.title}".`,
    "Deliver a complete, production-quality single-file page that fulfills the description above.",
    "Include realistic copy, working UI mechanics, and polished styling appropriate to this template.",
    "Do not return a generic placeholder card or unrelated layout.",
  ].filter(Boolean);

  if (shouldAttachPremiumEnhancer(resolvedProfile)) {
    parts.push(premiumVisualEnhancer.trim());
  }

  if (resolvedProfile.promptEnhancer.trim()) {
    parts.push(resolvedProfile.promptEnhancer.trim());
  } else if (wantsNeonParallaxPreset(`${base} ${template.prompt}`)) {
    parts.push(neonParallaxPreset.trim());
  }

  return parts.join("\n\n");
}

const promptMatchRules: Array<{ id: string; keywords: string[] }> = [
  { id: "snake-game", keywords: ["snake"] },
  { id: "tic-tac-toe", keywords: ["tic", "board"] },
  { id: "memory-game", keywords: ["memory", "card"] },
  { id: "pomodoro-timer", keywords: ["pomodoro", "timer"] },
  { id: "photo-portfolio", keywords: ["photo", "gallery"] },
  { id: "kanban-board", keywords: ["kanban", "task"] },
  { id: "wordpress-landing", keywords: ["wordpress", "landing", "marketing"] },
];

export function getPromptMock(promptText: string): string {
  const norm = promptText.toLowerCase();
  const matchedRule = promptMatchRules.find((rule) =>
    rule.keywords.some((keyword) => norm.includes(keyword)),
  );
  if (matchedRule) {
    return promptLibrary.find((prompt) => prompt.id === matchedRule.id)?.mockCode || "";
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VibeCraft Preview</title>
  <style>
    body { background:#09090b;color:#fff;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0 }
    .card { background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);padding:30px;border-radius:16px;max-width:400px;text-align:center }
    h1 { color:#5b35d5 } p { color:#aaa;font-size:14px }
  </style>
</head>
<body>
  <div class="card">
    <h1>Custom Generation</h1>
    <p>Prompt: <strong>${promptText}</strong></p>
    <p>Configure server Mistral keys or add BYOK keys in Builder settings for live AI output.</p>
  </div>
</body>
</html>`;
}
