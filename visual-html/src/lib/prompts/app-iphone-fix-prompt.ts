/**
 * Master fix prompt for Cursor / Agent sessions targeting ~30% mobile shell improvement
 * on iPhone 17 Air (420×912) and legacy compact (393×852).
 */
export const APP_IPHONE_17_AIR_FIX_PROMPT = `Fix and improve the PNGtoHTML React app mobile shell for iPhone 17 Air without changing the purple brand identity (#0f0f0f).

Target devices:
- Primary: iPhone 17 Air — 420×912 CSS px @3x, Dynamic Island safe-area top ~59px, home indicator bottom ~34px
- Fallback: iPhone compact — 393×852 CSS px @3x (same safe-area pattern)

Required improvements (acceptance: npm run test:integrity:iphone-17-air passes):

1. Viewport & safe-area
- Use h-dvh / min-h-0 flex stacks; no double scroll on mobile editor
- All fixed bottom UI must use env(safe-area-inset-bottom) or --editor-safe-bottom / --shell-safe-bottom
- Files: src/components/editor/editor-layout.tsx, src/components/editor/editor-prompt-bar.tsx, builder mobile nav

2. Touch targets (min 44×44px)
- Primary CTAs: upload, generate, builder-send, cancel generation, mode tabs
- Use min-h-11 (44px) on mobile submit buttons; icon-only buttons at least 44×44 tap area

3. Mobile editor stack
- Preview ~55% / chat ~45% on mobile (editor-layout)
- GenerationPipelineCard + PreviewSkeleton visible during generation; no horizontal overflow at 420px and 393px
- Preserve testids: editor-layout, editor-preview-stage, editor-chat-panel, editor-prompt-bar, builder-mobile-*

4. PWA shell parity
- APP_VIEWPORT with viewport-fit=cover in src/lib/app-brand.ts
- theme-color #0f0f0f, apple-mobile-web-app-capable, standalone meta unchanged

5. Motion accessibility
- prefers-reduced-motion: disable pipeline shimmer, step pulse, check-pop; use instant scroll instead of smooth scrollIntoView
- Files: src/styles.css, src/hooks/use-editor-studio.ts, src/components/builder/builder-studio-view.tsx

6. Performance
- useAnimatedNumber must not cause layout thrashing; respect reduced motion at runtime (not only module load)

7. i18n & a11y
- aria-live="polite" on pipeline status; focus-visible on mobile tabs and prompt bar
- i18n keys: builder.mobile.deviceIphone17Air (420px), builder.mobile.deviceIphoneCompact (393px)

8. Do not
- Change route structure or remove existing testids
- Migrate to Apple SF Blue or full HIG color system
- Add new npm dependencies

Return: list of changed files with brief rationale per file. Run test:integrity:iphone-17-air before finishing.`;

export const APP_IPHONE_FIX_ACCEPTANCE = [
  "npm run typecheck",
  "npm run lint",
  "npm run test:integrity:iphone-17-air",
] as const;
