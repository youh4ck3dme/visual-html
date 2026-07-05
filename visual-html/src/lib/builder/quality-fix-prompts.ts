import type { HtmlHealthCheckResult } from "@/lib/builder/html-health-check";
import type { BuilderQualityProfileId } from "@/lib/builder/quality-profiles";
import { resolveBuilderQualityProfile } from "@/lib/builder/quality-profiles";

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

/** Targets iPhone 17 Air (420px) and compact (393px) PWA/mobile HTML output. */
export const IPHONE_AIR_HTML_FIX_PROMPT = `Fix the current HTML/CSS for iPhone 17 Air and compact iPhone viewports without changing core layout, content, or visual identity.

Target viewports:
- iPhone 17 Air: 420×912 CSS px
- iPhone compact: 393×852 CSS px
- Tablet: max-width 768px, 1024px

Warnings to fix:
1. Missing viewport-fit=cover or viewport meta
2. Animations without prefers-reduced-motion fallback
3. Missing focus/focus-visible styles
4. Horizontal overflow on 420px and 393px widths
5. Touch targets below 44px height on primary CTAs
6. Missing safe-area padding on fixed bottom navigation or toolbars

Required changes:

1. Viewport & safe-area:
- <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
- padding-bottom: env(safe-area-inset-bottom, 0px) on fixed bottom bars
- padding-top: env(safe-area-inset-top, 0px) on fixed top bars when needed

2. Responsive breakpoints — add @media for:
- max-width: 1024px
- max-width: 768px
- max-width: 420px (iPhone 17 Air)
- max-width: 393px (iPhone compact)
- No horizontal overflow (overflow-x: hidden on body if needed)

3. Touch-friendly controls:
- Primary buttons and nav items minimum 44px height
- Adequate gap between tappable elements (8px+)

4. Reduced motion:
- @media (prefers-reduced-motion: reduce) { disable animations, transitions, parallax, smooth scroll }

5. Focus styles:
- :focus-visible ring/glow on all interactive elements

6. Preserve existing colors, content, section order, CSS variables, and JavaScript behavior.

7. Do not add external libraries, Tailwind CDN, React, or remove sections.

Return the complete corrected single-file HTML only.
Do not explain anything.
Do not wrap the result in Markdown.`;

/** Refinement chip instruction for SEO improvements in screenshot workflow. */
export const SEO_REFINEMENT_INSTRUCTION = `Optimize for SEO without changing layout or visual design:
- Add a descriptive <title> and <meta name="description"> when missing
- Use a single logical <h1> and semantic heading hierarchy
- Add meaningful alt text on images; set lang on <html> when missing
- Include Open Graph tags (og:title, og:description) where appropriate
- Prefer semantic elements (<main>, <nav>, <article>, <section>) over generic divs`;

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
  minimumScore = 0,
): boolean {
  if (!health) return false;
  if (minimumScore > 0 && health.score < minimumScore) return true;
  return health.findings.some(
    (finding) => finding.severity !== "info" && QUALITY_POLISH_FIX_FINDING_IDS.has(finding.id),
  );
}

/** Picks iPhone Air fix prompt for PWA mobile profile; otherwise Apple Glass polish. */
export function resolveQualityPolishFixPrompt(
  profileId: BuilderQualityProfileId = "auto",
  userPrompt = "",
): string {
  const resolvedId =
    profileId === "auto" ? resolveBuilderQualityProfile("auto", userPrompt).id : profileId;
  return resolvedId === "pwa-mobile"
    ? IPHONE_AIR_HTML_FIX_PROMPT
    : APPLE_GLASS_QUALITY_POLISH_FIX_PROMPT;
}
