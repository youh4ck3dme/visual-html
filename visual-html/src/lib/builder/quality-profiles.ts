import type { BuilderOrchestrationMode } from "@/lib/builder/orchestration-mode";

export type BuilderQualityProfileId =
  | "auto"
  | "premium-saas"
  | "neon-parallax"
  | "apple-glass"
  | "dashboard-pro"
  | "pwa-mobile"
  | "wordpress-landing"
  | "luxury-brand"
  | "minimal-clean";

export type BuilderQualityProfile = {
  id: BuilderQualityProfileId;
  labelKey: `builder.profile.${string}.label`;
  descriptionKey: `builder.profile.${string}.description`;
  recommendedMode: BuilderOrchestrationMode;
  keywords: string[];
  promptEnhancer: string;
  healthExpectations: {
    minimumScore: number;
    requireViewport: boolean;
    requireReducedMotion: boolean;
    requireMediaQueries: boolean;
    requireCssVariables: boolean;
    allowExternalScripts: boolean;
  };
};

export const BUILDER_QUALITY_PROFILE_IDS = [
  "auto",
  "premium-saas",
  "neon-parallax",
  "apple-glass",
  "dashboard-pro",
  "pwa-mobile",
  "wordpress-landing",
  "luxury-brand",
  "minimal-clean",
] as const satisfies readonly BuilderQualityProfileId[];

export const DEFAULT_BUILDER_QUALITY_PROFILE_ID: BuilderQualityProfileId = "auto";

const STORAGE_KEY = "visual-html.builder.qualityProfile";

export const BUILDER_QUALITY_PROFILE_EVENT = "builder-quality-profile-change";

const AUTO_DETECT_ORDER: Exclude<BuilderQualityProfileId, "auto" | "premium-saas">[] = [
  "neon-parallax",
  "apple-glass",
  "dashboard-pro",
  "pwa-mobile",
  "wordpress-landing",
  "luxury-brand",
  "minimal-clean",
];

const DEFAULT_HEALTH_EXPECTATIONS = {
  minimumScore: 85,
  requireViewport: true,
  requireReducedMotion: false,
  requireMediaQueries: true,
  requireCssVariables: true,
  allowExternalScripts: false,
} as const;

export const BUILDER_QUALITY_PROFILES: Record<BuilderQualityProfileId, BuilderQualityProfile> = {
  auto: {
    id: "auto",
    labelKey: "builder.profile.auto.label",
    descriptionKey: "builder.profile.auto.description",
    recommendedMode: "pro",
    keywords: [],
    promptEnhancer: "",
    healthExpectations: { ...DEFAULT_HEALTH_EXPECTATIONS },
  },
  "premium-saas": {
    id: "premium-saas",
    labelKey: "builder.profile.premiumSaas.label",
    descriptionKey: "builder.profile.premiumSaas.description",
    recommendedMode: "pro",
    keywords: ["saas", "startup", "pricing", "product", "landing", "b2b", "software"],
    promptEnhancer: `Quality profile: Premium SaaS.
Style: modern premium SaaS, strong hierarchy, polished cards, clean gradients, professional UI, credible product marketing feel.
Use CSS variables, responsive layout, semantic structure, and tasteful hover states.`,
    healthExpectations: { ...DEFAULT_HEALTH_EXPECTATIONS, minimumScore: 85 },
  },
  "neon-parallax": {
    id: "neon-parallax",
    labelKey: "builder.profile.neonParallax.label",
    descriptionKey: "builder.profile.neonParallax.description",
    recommendedMode: "beast",
    keywords: [
      "neon",
      "parallax",
      "3d",
      "4d",
      "cyberpunk",
      "futuristic",
      "holograph",
      "holographic",
      "cinematic",
      "sci-fi",
    ],
    promptEnhancer: `Quality profile: Neon Parallax.
Style: futuristic neon, cinematic dark interface, 3D parallax depth, glass layers, holographic panels, atmospheric glow.
Technical: use perspective and preserve-3d, positioned floating layers, CSS variables, responsive design, prefers-reduced-motion fallback.`,
    healthExpectations: {
      minimumScore: 80,
      requireViewport: true,
      requireReducedMotion: true,
      requireMediaQueries: true,
      requireCssVariables: true,
      allowExternalScripts: false,
    },
  },
  "apple-glass": {
    id: "apple-glass",
    labelKey: "builder.profile.appleGlass.label",
    descriptionKey: "builder.profile.appleGlass.description",
    recommendedMode: "pro",
    keywords: ["apple", "glass", "liquid", "ios", "sf pro", "vision", "aesthetic", "refined"],
    promptEnhancer: `Quality profile: Apple Glass.
Style: Apple-like glass surfaces, liquid gradients, soft shadows, refined spacing, premium app feel, calm luxury UI.
Use backdrop-filter, subtle depth, elegant typography, and responsive polish.`,
    healthExpectations: {
      ...DEFAULT_HEALTH_EXPECTATIONS,
      minimumScore: 88,
    },
  },
  "dashboard-pro": {
    id: "dashboard-pro",
    labelKey: "builder.profile.dashboardPro.label",
    descriptionKey: "builder.profile.dashboardPro.description",
    recommendedMode: "pro",
    keywords: [
      "dashboard",
      "admin",
      "analytics",
      "chart",
      "table",
      "widget",
      "kpi",
      "metrics",
      "backoffice",
    ],
    promptEnhancer: `Quality profile: Dashboard Pro.
Style: serious dashboard, data cards, tables, filters, status widgets, responsive admin shell, clear information hierarchy.
Prioritize scanability, dense-but-clean layout, and mobile-friendly breakpoints.`,
    healthExpectations: {
      ...DEFAULT_HEALTH_EXPECTATIONS,
      minimumScore: 88,
    },
  },
  "pwa-mobile": {
    id: "pwa-mobile",
    labelKey: "builder.profile.pwaMobile.label",
    descriptionKey: "builder.profile.pwaMobile.description",
    recommendedMode: "pro",
    keywords: [
      "pwa",
      "mobile app",
      "bottom nav",
      "safe-area",
      "touch",
      "installable",
      "phone",
      "app shell",
    ],
    promptEnhancer: `Quality profile: PWA Mobile.
Style: mobile-first app shell, safe-area support, bottom navigation, touch-friendly controls, thumb-reachable actions.
Use viewport meta with viewport-fit=cover, responsive spacing, and reduced visual noise.
Breakpoints must cover iPhone 17 Air (420px) and iPhone compact (393px) with min 44px touch targets.`,
    healthExpectations: {
      ...DEFAULT_HEALTH_EXPECTATIONS,
      minimumScore: 88,
    },
  },
  "wordpress-landing": {
    id: "wordpress-landing",
    labelKey: "builder.profile.wordpressLanding.label",
    descriptionKey: "builder.profile.wordpressLanding.description",
    recommendedMode: "pro",
    keywords: [
      "wordpress",
      "plugin",
      "theme",
      "landing page",
      "marketing",
      "conversion",
      "cta",
      "business",
    ],
    promptEnhancer: `Quality profile: WordPress Landing.
Style: WordPress/plugin/business landing page, feature sections, benefit blocks, social proof, pricing/CTA, clean conversion layout.
Use credible marketing copy and responsive section rhythm.`,
    healthExpectations: {
      ...DEFAULT_HEALTH_EXPECTATIONS,
      minimumScore: 85,
    },
  },
  "luxury-brand": {
    id: "luxury-brand",
    labelKey: "builder.profile.luxuryBrand.label",
    descriptionKey: "builder.profile.luxuryBrand.description",
    recommendedMode: "pro",
    keywords: [
      "luxury",
      "editorial",
      "brand",
      "high-end",
      "couture",
      "fashion",
      "boutique",
      "prestige",
    ],
    promptEnhancer: `Quality profile: Luxury Brand.
Style: premium luxury visual identity, cinematic hero, editorial spacing, refined contrast, elegant typography, aspirational brand feel.
Avoid cheap template aesthetics and visual clutter.`,
    healthExpectations: {
      ...DEFAULT_HEALTH_EXPECTATIONS,
      minimumScore: 86,
    },
  },
  "minimal-clean": {
    id: "minimal-clean",
    labelKey: "builder.profile.minimalClean.label",
    descriptionKey: "builder.profile.minimalClean.description",
    recommendedMode: "fast",
    keywords: ["minimal", "clean", "simple", "understated", "whitespace", "bare", "lightweight"],
    promptEnhancer: `Quality profile: Minimal Clean.
Style: clean minimal interface, precise spacing, reduced motion, no visual noise, strong readability, restrained palette.
Prefer simplicity over decoration.`,
    healthExpectations: {
      minimumScore: 90,
      requireViewport: true,
      requireReducedMotion: true,
      requireMediaQueries: true,
      requireCssVariables: false,
      allowExternalScripts: false,
    },
  },
};

export function isBuilderQualityProfileId(value: unknown): value is BuilderQualityProfileId {
  return (
    typeof value === "string" &&
    BUILDER_QUALITY_PROFILE_IDS.includes(value as BuilderQualityProfileId)
  );
}

function readStoredProfileId(): BuilderQualityProfileId | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isBuilderQualityProfileId(stored)) return stored;
  } catch {
    return null;
  }

  return null;
}

export function getBuilderQualityProfileId(): BuilderQualityProfileId {
  return readStoredProfileId() ?? DEFAULT_BUILDER_QUALITY_PROFILE_ID;
}

export function saveBuilderQualityProfileId(profileId: BuilderQualityProfileId): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, profileId);
    window.dispatchEvent(
      new CustomEvent(BUILDER_QUALITY_PROFILE_EVENT, {
        detail: profileId,
      }),
    );
  } catch {
    // ignore restricted storage
  }
}

function detectProfileFromPrompt(userPrompt: string): BuilderQualityProfile | null {
  const norm = userPrompt.toLowerCase();

  for (const profileId of AUTO_DETECT_ORDER) {
    const profile = BUILDER_QUALITY_PROFILES[profileId];
    if (profile.keywords.some((keyword) => norm.includes(keyword))) {
      return profile;
    }
  }

  return null;
}

export function resolveBuilderQualityProfile(
  profileId: BuilderQualityProfileId,
  userPrompt: string,
): BuilderQualityProfile {
  if (profileId !== "auto") {
    return BUILDER_QUALITY_PROFILES[profileId];
  }

  return detectProfileFromPrompt(userPrompt) ?? BUILDER_QUALITY_PROFILES["premium-saas"];
}

export function shouldShowFastModeProfileWarning(
  profile: BuilderQualityProfile,
  orchestrationMode: BuilderOrchestrationMode,
): boolean {
  return orchestrationMode === "fast" && profile.recommendedMode !== "fast";
}
