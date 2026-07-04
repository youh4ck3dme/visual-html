import type { HtmlHealthCheckResult } from "@/lib/builder/html-health-check";

/** Targets motion, focus-visible, and responsive media-query health warnings. */
export const APPLE_GLASS_QUALITY_POLISH_FIX_PROMPT = `Fix the current HTML/CSS to remove these quality warnings without changing the core layout, content, or visual identity.

Warnings to fix:
1. Animations without reduced-motion fallback
2. Missing focus/focus-visible styles
3. Missing responsive media queries for smaller screens

Required changes:

1. Add reduced motion support:
- Add @media (prefers-reduced-motion: reduce)
- Disable or heavily reduce all animations, transitions, parallax, shimmer, floating, transform movement, scroll animations, and smooth scrolling.
- Keep the design visually premium when motion is reduced.

2. Add accessibility focus styles:
- Add clear :focus-visible styles for all interactive elements:
  buttons, links, inputs, selects, textareas, tabs, FAQ buttons, menu buttons, CTA buttons, cards that are clickable.
- Focus states must be visible on dark, light, and glass backgrounds.
- Use a premium Apple Glass style ring/glow, not ugly default browser outlines.

3. Add responsive media queries:
- Add @media rules for at least:
  max-width: 1024px
  max-width: 768px
  max-width: 480px
- Ensure the page works on iPhone-sized screens.
- No horizontal overflow.
- Hero, navigation, cards, pricing, dashboard mockup, FAQ, and footer must stack correctly.
- Buttons must remain thumb-friendly with minimum 44px height.
- Text must scale with clamp() or responsive font sizes.

4. Preserve:
- Existing colors
- Apple Glass / premium aesthetic
- Existing content
- Existing section order
- Existing CSS variables
- Existing mode switcher if present
- Existing JavaScript behavior

5. Do not:
- Add external libraries
- Add Tailwind, Bootstrap, React, or CDN assets
- Remove sections
- Replace the design with a generic layout
- Add login forms or sensitive banking fields

Return the complete corrected single-file HTML only.
Do not explain anything.
Do not wrap the result in Markdown.`;

const QUALITY_POLISH_FIX_FINDING_IDS = new Set([
  "animationWithoutReducedMotion",
  "noFocusStyles",
  "noMediaQueriesMultiSection",
  "fixedLargeWidths",
  "mobileHostileWidth",
  "profile.reducedMotionExpected",
  "profile.mediaQueriesExpected",
  "pointerParallaxNoReducedMotion",
]);

export function shouldOfferQualityPolishFix(
  health: HtmlHealthCheckResult | null | undefined,
): boolean {
  if (!health) return false;
  return health.findings.some(
    (finding) => finding.severity !== "info" && QUALITY_POLISH_FIX_FINDING_IDS.has(finding.id),
  );
}
