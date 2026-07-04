import type { MessageKey } from "@/lib/i18n/messages";
import type {
  BuilderQualityProfile,
  BuilderQualityProfileId,
} from "@/lib/builder/quality-profiles";

export type HtmlHealthSeverity = "critical" | "warning" | "info";

export type HtmlHealthCategory =
  | "structure"
  | "security"
  | "accessibility"
  | "responsive"
  | "motion"
  | "visual"
  | "javascript"
  | "parallax"
  | "performance";

export type HtmlHealthFinding = {
  id: string;
  category: HtmlHealthCategory;
  severity: HtmlHealthSeverity;
};

export type HtmlHealthChips = {
  viewport: boolean;
  reducedMotion: boolean;
  mediaQueries: boolean;
  cssVariables: boolean;
  externalScripts: boolean;
};

export type HtmlHealthProfileSummary = {
  id: BuilderQualityProfileId;
  labelKey: string;
  minimumScore: number;
};

export type HtmlHealthCheckResult = {
  score: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  findings: HtmlHealthFinding[];
  chips: HtmlHealthChips;
  checkedAt: number;
  profile?: HtmlHealthProfileSummary;
};

export type HtmlHealthCheckOptions = {
  userPrompt?: string;
  qualityProfileId?: BuilderQualityProfileId;
  qualityProfile?: BuilderQualityProfile;
};

const SCORE_START = 100;
const CRITICAL_PENALTY = 18;
const WARNING_PENALTY = 6;

const VISUAL_PROMPT_MARKERS = {
  neon: /\bneon\b/i,
  glass: /\bglass|glassmorphism\b/i,
  parallax: /\bparallax\b/i,
  threeD: /\b3d\b/i,
  wow: /\bwow\b/i,
  premium: /\bpremium\b/i,
} as const;

function normalizeHtml(html: string): string {
  return html.replace(/^\uFEFF/, "").trim();
}

function extractBlocks(html: string): { styles: string; scripts: string; inline: string } {
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1])
    .join("\n");
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1])
    .join("\n");
  return { styles, scripts, inline: `${styles}\n${scripts}` };
}

function parseDocument(html: string): Document | null {
  if (typeof DOMParser === "undefined") return null;
  try {
    return new DOMParser().parseFromString(html, "text/html");
  } catch {
    return null;
  }
}

function collectIdsAndClasses(html: string): { ids: Set<string>; classes: Set<string> } {
  const ids = new Set<string>();
  const classes = new Set<string>();

  for (const match of html.matchAll(/\bid=["']([^"']+)["']/gi)) {
    ids.add(match[1]);
  }
  for (const match of html.matchAll(/\bclass=["']([^"']+)["']/gi)) {
    for (const token of match[1].split(/\s+/)) {
      if (token) classes.add(token);
    }
  }

  return { ids, classes };
}

function addFinding(
  findings: HtmlHealthFinding[],
  id: string,
  category: HtmlHealthCategory,
  severity: HtmlHealthSeverity,
): void {
  if (findings.some((finding) => finding.id === id)) return;
  findings.push({ id, category, severity });
}

function computeScore(findings: HtmlHealthFinding[]): number {
  let score = SCORE_START;
  for (const finding of findings) {
    if (finding.severity === "critical") score -= CRITICAL_PENALTY;
    if (finding.severity === "warning") score -= WARNING_PENALTY;
  }
  return Math.max(0, Math.min(100, score));
}

function hasViewportMeta(html: string): boolean {
  return /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html);
}

function hasReducedMotionSupport(styles: string): boolean {
  return /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i.test(styles);
}

function hasMotionSignals(inline: string, html: string): boolean {
  return (
    /@keyframes\b/i.test(inline) ||
    /\banimation\s*:/i.test(inline) ||
    /\btransition\s*:/i.test(inline) ||
    /requestAnimationFrame\s*\(/i.test(inline) ||
    /\banimate\s*\(/i.test(html)
  );
}

function indicatesParallaxOr3d(text: string): boolean {
  return /\bparallax\b|\b3d\b|\bfloating\b/i.test(text);
}

function checkStructure(html: string, findings: HtmlHealthFinding[]): void {
  if (!/<!DOCTYPE\s+html/i.test(html)) {
    addFinding(findings, "missingDoctype", "structure", "critical");
  }
  if (!/<html[\s>]/i.test(html)) {
    addFinding(findings, "missingHtml", "structure", "critical");
  }
  if (!/<head[\s>]/i.test(html)) {
    addFinding(findings, "missingHead", "structure", "critical");
  }
  if (!/<body[\s>]/i.test(html)) {
    addFinding(findings, "missingBody", "structure", "critical");
  }
  if (!/<title[^>]*>[\s\S]*?<\/title>/i.test(html)) {
    addFinding(findings, "missingTitle", "structure", "warning");
  }
  if (/```|`{3,}/m.test(html)) {
    addFinding(findings, "markdownFences", "structure", "critical");
  }
}

function checkSecurity(html: string, scripts: string, findings: HtmlHealthFinding[]): void {
  if (/<script\b[^>]*\bsrc=["']https?:\/\//i.test(html)) {
    addFinding(findings, "externalScript", "security", "critical");
  }
  if (
    /\bimport\s*\(\s*['"]https?:\/\//i.test(scripts) ||
    /\bimport\s+[^'"]+['"]https?:\/\//i.test(scripts)
  ) {
    addFinding(findings, "inlineRemoteImport", "security", "critical");
  }
  if (/\beval\s*\(/i.test(scripts)) {
    addFinding(findings, "evalUsage", "security", "critical");
  }
  if (/new\s+Function\s*\(/i.test(scripts)) {
    addFinding(findings, "newFunctionUsage", "security", "critical");
  }
  if (/document\.write\s*\(/i.test(scripts)) {
    addFinding(findings, "documentWrite", "security", "critical");
  }
  if (/\.innerHTML\s*=/i.test(scripts)) {
    addFinding(findings, "suspiciousInnerHtml", "security", "warning");
  }
  if (/javascript:/i.test(html)) {
    addFinding(findings, "javascriptUrl", "security", "critical");
  }
  if (
    /<img\b[^>]*\bsrc=["']https?:\/\/[^"']+["'][^>]*\b(width|height)=["']1(px)?["']/i.test(html) ||
    /<img\b[^>]*\b(width|height)=["']1(px)?["'][^>]*\bsrc=["']https?:\/\//i.test(html)
  ) {
    addFinding(findings, "remoteTrackingPixel", "security", "warning");
  }
  if (/<iframe\b[^>]*\bsrc=["']https?:\/\//i.test(html)) {
    addFinding(findings, "remoteIframe", "security", "critical");
  }
}

function checkJavaScript(
  html: string,
  scripts: string,
  ids: Set<string>,
  classes: Set<string>,
  findings: HtmlHealthFinding[],
): void {
  const selectorPatterns = [
    /querySelector(?:All)?\(\s*['"](#[^'"]+)['"]/gi,
    /querySelector(?:All)?\(\s*['"](\.[^'"]+)['"]/gi,
    /getElementById\(\s*['"]([^'"]+)['"]/gi,
  ];

  for (const pattern of selectorPatterns) {
    for (const match of scripts.matchAll(pattern)) {
      const selector = match[1];
      if (selector.includes("${") || selector.includes("`")) continue;

      if (selector.startsWith("#")) {
        const id = selector.slice(1);
        if (id && !ids.has(id)) {
          addFinding(findings, "selectorNoMatch", "javascript", "warning");
          break;
        }
      } else if (selector.startsWith(".")) {
        const className = selector.slice(1);
        if (className && !classes.has(className)) {
          addFinding(findings, "selectorNoMatch", "javascript", "warning");
          break;
        }
      } else if (!ids.has(selector)) {
        addFinding(findings, "selectorNoMatch", "javascript", "warning");
        break;
      }
    }
  }

  if (
    /document\.getElementById\([^)]+\)\.addEventListener/i.test(scripts) ||
    /document\.querySelector\([^)]+\)\.addEventListener/i.test(scripts)
  ) {
    addFinding(findings, "unguardedEventListener", "javascript", "warning");
  }
}

function checkResponsive(html: string, styles: string, findings: HtmlHealthFinding[]): void {
  if (!hasViewportMeta(html)) {
    addFinding(findings, "missingViewport", "responsive", "warning");
  }

  const sectionCount =
    (html.match(/<section\b/gi) ?? []).length +
    (html.match(/<article\b/gi) ?? []).length +
    (html.match(/\bclass=["'][^"']*\bcard\b[^"']*["']/gi) ?? []).length;

  if (sectionCount >= 2 && !/@media\b/i.test(styles)) {
    addFinding(findings, "noMediaQueriesMultiSection", "responsive", "warning");
  }

  const fixedWidths = [...styles.matchAll(/\bwidth\s*:\s*(\d{3,})px/gi)].map((match) =>
    Number.parseInt(match[1], 10),
  );
  const largeFixedWidths = fixedWidths.filter((value) => value >= 900);
  if (largeFixedWidths.length >= 3) {
    addFinding(findings, "fixedLargeWidths", "responsive", "warning");
  }

  if (
    /\b(?:main|container|wrapper|body)\b[^{]*\{[^}]*\bwidth\s*:\s*1200px/i.test(styles) ||
    /\bwidth\s*:\s*1200px[^}]*\b(?:main|container|wrapper)\b/i.test(styles)
  ) {
    addFinding(findings, "mobileHostileWidth", "responsive", "warning");
  }
}

function checkMotion(
  styles: string,
  inline: string,
  html: string,
  findings: HtmlHealthFinding[],
): void {
  if (!hasMotionSignals(inline, html)) return;

  if (!hasReducedMotionSupport(styles)) {
    addFinding(findings, "animationWithoutReducedMotion", "motion", "warning");
  }

  const infiniteAnimations = (styles.match(/\binfinite\b/gi) ?? []).length;
  if (infiniteAnimations > 3) {
    addFinding(findings, "tooManyInfiniteAnimations", "motion", "warning");
  }
}

function getVisibleText(element: Element): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

function checkAccessibility(
  doc: Document | null,
  styles: string,
  html: string,
  findings: HtmlHealthFinding[],
): void {
  const interactive =
    doc?.querySelectorAll("button, a[href], input:not([type='hidden']), select, textarea") ?? [];

  if (doc) {
    for (const element of interactive) {
      const tag = element.tagName.toLowerCase();
      const ariaLabel = element.getAttribute("aria-label")?.trim();
      const ariaLabelledby = element.getAttribute("aria-labelledby");
      const title = element.getAttribute("title")?.trim();
      const text = getVisibleText(element);
      const hasLabel = Boolean(ariaLabel || ariaLabelledby || title || text);

      if (tag === "button" && !text && !ariaLabel && !ariaLabelledby) {
        addFinding(findings, "emptyButton", "accessibility", "warning");
        break;
      }

      if (!hasLabel) {
        addFinding(findings, "interactiveNoLabel", "accessibility", "warning");
        break;
      }

      const hasIconOnlyChild =
        element.querySelector("svg, i, img") != null &&
        text.length === 0 &&
        !ariaLabel &&
        !ariaLabelledby;
      if ((tag === "button" || tag === "a") && hasIconOnlyChild) {
        addFinding(findings, "iconOnlyNoAria", "accessibility", "warning");
        break;
      }
    }

    const images = doc.querySelectorAll("img");
    if (images.length > 0) {
      for (const image of images) {
        if (!image.hasAttribute("alt")) {
          addFinding(findings, "imageMissingAlt", "accessibility", "warning");
          break;
        }
      }
    }
  }

  const hasInteractive = /<button\b|<a\b[^>]*href=/i.test(html);
  const hasFocusStyles =
    /:focus-visible\b|:focus\b/.test(styles) ||
    /\bfocus-visible\b/.test(styles) ||
    /outline\s*:/i.test(styles);

  if (hasInteractive && !hasFocusStyles) {
    addFinding(findings, "noFocusStyles", "accessibility", "warning");
  }
}

function checkVisualQuality(
  userPrompt: string,
  html: string,
  styles: string,
  findings: HtmlHealthFinding[],
): void {
  const combined = `${html}\n${styles}`;

  if (VISUAL_PROMPT_MARKERS.neon.test(userPrompt)) {
    const hasNeonMarkers =
      /\bneon\b/i.test(combined) ||
      /text-shadow\s*:/i.test(styles) ||
      /box-shadow\s*:[^;]*(#[0-9a-f]{3,6}|rgb)/i.test(styles);
    if (!hasNeonMarkers) {
      addFinding(findings, "promptNeonMissing", "visual", "warning");
    }
  }

  if (VISUAL_PROMPT_MARKERS.glass.test(userPrompt)) {
    const hasGlassMarkers =
      /backdrop-filter\s*:/i.test(styles) ||
      /\bglass\b/i.test(combined) ||
      /rgba?\([^)]+\)\s*[^;]*blur/i.test(styles);
    if (!hasGlassMarkers) {
      addFinding(findings, "promptGlassMissing", "visual", "warning");
    }
  }

  if (
    VISUAL_PROMPT_MARKERS.parallax.test(userPrompt) ||
    VISUAL_PROMPT_MARKERS.threeD.test(userPrompt)
  ) {
    const hasParallaxMarkers =
      /\bparallax\b/i.test(combined) ||
      /perspective\s*:/i.test(styles) ||
      /transform-style\s*:\s*preserve-3d/i.test(styles) ||
      /translateZ\s*\(/i.test(styles);
    if (!hasParallaxMarkers) {
      addFinding(findings, "promptParallaxMissing", "visual", "warning");
    }
  }

  if (
    VISUAL_PROMPT_MARKERS.wow.test(userPrompt) ||
    VISUAL_PROMPT_MARKERS.premium.test(userPrompt)
  ) {
    const hasPremiumMarkers =
      /gradient/i.test(styles) ||
      /box-shadow\s*:/i.test(styles) ||
      /--[\w-]+\s*:/i.test(styles) ||
      /backdrop-filter\s*:/i.test(styles);
    if (!hasPremiumMarkers) {
      addFinding(findings, "promptPremiumMissing", "visual", "warning");
    }
  }
}

function checkParallax(
  userPrompt: string,
  html: string,
  styles: string,
  scripts: string,
  findings: HtmlHealthFinding[],
): void {
  const context = `${userPrompt}\n${html}\n${styles}\n${scripts}`;
  if (!indicatesParallaxOr3d(context)) return;

  const hasPerspective = /perspective\s*:/i.test(styles);
  const hasPreserve3d = /transform-style\s*:\s*preserve-3d/i.test(styles);
  const hasPositionedFloaters =
    /position\s*:\s*(absolute|fixed|sticky|relative)/i.test(styles) &&
    /\b(top|left|right|bottom)\s*:/i.test(styles);

  if (!hasPerspective && !hasPreserve3d) {
    addFinding(findings, "parallaxMissingPerspective", "parallax", "warning");
  }

  if (hasPreserve3d && !hasPerspective) {
    addFinding(findings, "transformStyleNoPerspective", "parallax", "warning");
  }

  if (!hasPositionedFloaters && /\b(top|left)\s*:/i.test(styles)) {
    addFinding(findings, "parallaxTopLeftNoPosition", "parallax", "warning");
  }

  for (const block of styles.split("}")) {
    const hasOffset = /\b(top|left)\s*:/i.test(block);
    const hasPosition = /\bposition\s*:\s*(absolute|relative|fixed|sticky)/i.test(block);
    if (hasOffset && !hasPosition) {
      addFinding(findings, "parallaxTopLeftNoPosition", "parallax", "warning");
      break;
    }
  }

  const hasPointerParallax =
    /mousemove/i.test(scripts) &&
    (/transform\s*=/i.test(scripts) || /\.style\.(?:top|left|transform)/i.test(scripts));
  if (hasPointerParallax && !hasReducedMotionSupport(styles)) {
    addFinding(findings, "pointerParallaxNoReducedMotion", "parallax", "warning");
  }
}

function checkProfileExpectations(
  profile: BuilderQualityProfile,
  score: number,
  chips: HtmlHealthChips,
  findings: HtmlHealthFinding[],
): void {
  const expectations = profile.healthExpectations;

  if (score < expectations.minimumScore) {
    addFinding(findings, "profile.minimumScoreNotMet", "visual", "warning");
  }
  if (expectations.requireReducedMotion && !chips.reducedMotion) {
    addFinding(findings, "profile.reducedMotionExpected", "motion", "warning");
  }
  if (expectations.requireMediaQueries && !chips.mediaQueries) {
    addFinding(findings, "profile.mediaQueriesExpected", "responsive", "warning");
  }
  if (expectations.requireCssVariables && !chips.cssVariables) {
    addFinding(findings, "profile.cssVariablesExpected", "visual", "warning");
  }
  if (!expectations.allowExternalScripts && chips.externalScripts) {
    addFinding(findings, "profile.externalScriptsNotAllowed", "security", "warning");
  }
}

function checkPerformance(html: string, styles: string, findings: HtmlHealthFinding[]): void {
  const particleMatches =
    (html.match(/\bparticle\b/gi) ?? []).length +
    (html.match(/class=["'][^"']*dot[^"']*["']/gi) ?? []).length;
  const loopParticleCreation = /for\s*\([^)]*\)\s*\{[^}]*(?:particle|dot)/i.test(html);

  if (particleMatches > 80 || loopParticleCreation) {
    addFinding(findings, "excessiveParticles", "performance", "warning");
  }

  const shadowCount = (styles.match(/box-shadow\s*:/gi) ?? []).length;
  if (shadowCount > 15) {
    addFinding(findings, "excessiveBoxShadow", "performance", "info");
  }

  const willChangeCount = (styles.match(/will-change\s*:/gi) ?? []).length;
  if (willChangeCount > 5) {
    addFinding(findings, "willChangeOveruse", "performance", "warning");
  }
}

export function healthFindingTitleKey(id: string): MessageKey {
  return `builder.health.finding.${id}.title` as MessageKey;
}

export function healthFindingMessageKey(id: string): MessageKey {
  return `builder.health.finding.${id}.message` as MessageKey;
}

export function runHtmlHealthCheck(
  htmlInput: string,
  options: HtmlHealthCheckOptions = {},
): HtmlHealthCheckResult {
  const html = normalizeHtml(htmlInput);
  const findings: HtmlHealthFinding[] = [];

  if (!html) {
    return {
      score: 0,
      criticalCount: 0,
      warningCount: 0,
      infoCount: 0,
      findings: [],
      chips: {
        viewport: false,
        reducedMotion: false,
        mediaQueries: false,
        cssVariables: false,
        externalScripts: false,
      },
      checkedAt: Date.now(),
    };
  }

  const { styles, scripts, inline } = extractBlocks(html);
  const doc = parseDocument(html);
  const { ids, classes } = collectIdsAndClasses(html);
  const userPrompt = options.userPrompt ?? "";

  checkStructure(html, findings);
  checkSecurity(html, scripts, findings);
  checkJavaScript(html, scripts, ids, classes, findings);
  checkResponsive(html, styles, findings);
  checkMotion(styles, inline, html, findings);
  checkAccessibility(doc, styles, html, findings);
  checkVisualQuality(userPrompt, html, styles, findings);
  checkParallax(userPrompt, html, styles, scripts, findings);
  checkPerformance(html, styles, findings);

  const chips: HtmlHealthChips = {
    viewport: hasViewportMeta(html),
    reducedMotion: hasReducedMotionSupport(styles),
    mediaQueries: /@media\b/i.test(styles),
    cssVariables: /--[\w-]+\s*:/i.test(styles) || /\bvar\s*\(/i.test(styles),
    externalScripts: /<script\b[^>]*\bsrc=["']https?:\/\//i.test(html),
  };

  const qualityProfile = options.qualityProfile;
  const preliminaryScore = computeScore(findings);

  if (qualityProfile && qualityProfile.id !== "auto") {
    checkProfileExpectations(qualityProfile, preliminaryScore, chips, findings);
  }

  const criticalCount = findings.filter((finding) => finding.severity === "critical").length;
  const warningCount = findings.filter((finding) => finding.severity === "warning").length;
  const infoCount = findings.filter((finding) => finding.severity === "info").length;
  const score = computeScore(findings);

  return {
    score,
    criticalCount,
    warningCount,
    infoCount,
    findings,
    chips,
    checkedAt: Date.now(),
    profile:
      qualityProfile && qualityProfile.id !== "auto"
        ? {
            id: qualityProfile.id,
            labelKey: qualityProfile.labelKey,
            minimumScore: qualityProfile.healthExpectations.minimumScore,
          }
        : undefined,
  };
}
