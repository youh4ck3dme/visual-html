export const messages = {
  en: {
    // ── Navigation ──────────────────────────────────────────────
    "nav.appAria": "Application navigation",
    "nav.mobileAria": "Mobile navigation",
    "nav.homeAria": "PNGtoHTML home",
    "nav.homeTitle": "PNGtoHTML",
    "nav.projects": "Projects",
    "nav.new": "Screenshot",
    "nav.builder": "Studio",
    "nav.support": "Support",
    "nav.settings": "Settings",
    "nav.account": "Account",
    "nav.comingSoon": "Coming soon",

    // ── Locale switcher ─────────────────────────────────────────
    "locale.en": "EN",
    "locale.sk": "SK",
    "locale.groupAria": "Language",
    "locale.switchAria": "Switch language to {lang}",

    // ── Theme ───────────────────────────────────────────────────
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
    "theme.groupAria": "Color theme",
    "theme.compactAria": "Theme: {label}. Click to switch.",
    "theme.systemResolved": "System ({resolved})",

    // ── Top bar / home workspace ────────────────────────────────
    "topbar.credit":
      "Mistral OCR + Pixtral · Rate limits per IP · Review AI output before shipping",
    "app.settings.title": "Settings",
    "app.settings.description":
      "Generation defaults and Mistral API keys for Screenshot and Studio.",
    "app.settings.generationSection": "Screenshot generation defaults",
    "app.settings.saveSuccess": "Settings saved",

    // ── Lovable editor shell ────────────────────────────────────
    "editor.promptPlaceholder": "Ask PNGtoHTML or describe a change…",
    "editor.build": "Build",
    "editor.console": "Console",
    "editor.consoleEmpty": "No console output yet. Enable JS in preview to capture logs.",
    "editor.fixWithAi": "Fix with AI",
    "editor.model": "Model",
    "editor.modelPickerAria": "AI model for Studio",
    "editor.previewEmpty": "Build or upload to see preview here",
    "editor.previewEmptyHint": "Your generated HTML renders in this device frame.",
    "editor.screenshot.emptyTitle": "Preview will appear here",
    "editor.screenshot.emptyHint": "Upload a screenshot and generate HTML to see the live preview.",
    "editor.projects.selectTitle": "Select a project",
    "editor.projects.selectHint": "Choose a saved project from the list to inspect its output.",
    "editor.templates.viewAll": "All templates",

    "mode.groupAria": "Input mode",
    "mode.upload": "Upload",
    "mode.url": "URL",
    "mode.text": "Text",
    "mode.import": "Import",
    "advancedSettings.summary": "Advanced generation settings",

    // ── Input mode panels (URL / Text / Import) ─────────────────
    "input.url.title": "Load image from URL",
    "input.url.hint": "Paste a direct link to a PNG, JPG, or WebP screenshot.",
    "input.url.placeholder": "https://example.com/screenshot.png",
    "input.url.action": "Load image",
    "input.url.loading": "Fetching…",
    "input.url.error.empty": "Enter an image URL.",
    "input.url.error.fetchFailed": "Could not load image from URL.",

    "input.text.title": "Describe your UI",
    "input.text.hint":
      "We'll render your description as a reference image and pass it to the generator.",
    "input.text.placeholder": "e.g. Dashboard with sidebar, KPI cards, and a data table…",
    "input.text.action": "Use description",
    "input.text.loading": "Preparing…",
    "input.text.error.empty": "Enter a UI description.",
    "input.text.error.renderFailed": "Could not prepare description image.",

    "input.import.title": "Import saved projects",
    "input.import.hint":
      "Upload a JSON export from Projects to restore one or more saved generations.",
    "input.import.action": "Choose JSON file",
    "input.import.loading": "Importing…",
    "input.import.error.invalid": "Invalid or empty project file.",
    "input.import.error.persistFailed": "Could not save imported projects.",

    // ── Upload dropzone ─────────────────────────────────────────
    "upload.dropTitle": "Drop a UI screenshot here",
    "upload.dropHint": "PNG, JPG, or WebP · up to {maxMb} MB",
    "upload.chooseFile": "Choose file",
    "upload.inputAria": "Upload image file",

    // ── Upload errors ───────────────────────────────────────────
    "upload.error.unsupportedFormat": "Unsupported format. Use PNG, JPG, or WebP.",
    "upload.error.emptyFile": "File is empty.",
    "upload.error.fileTooLarge": "File exceeds {maxMb} MB.",
    "upload.error.couldNotRead": "Could not read file",
    "upload.error.couldNotProcess": "Could not process image",
    "upload.error.invalidImage": "Invalid image",
    "upload.error.couldNotOptimize": "Could not optimize image",
    "upload.error.couldNotPrepare": "Could not prepare image for upload",

    // ── Image preview ───────────────────────────────────────────
    "imagePreview.altThumb": "Uploaded UI screenshot preview",
    "imagePreview.altFull": "Uploaded UI screenshot full size",
    "imagePreview.forensicTitle": "Open forensic scan",
    "imagePreview.forensicAria": "Forensic scan: {fileName}",
    "imagePreview.forensicHint": "Click thumbnail for forensic scan",
    "imagePreview.removeAria": "Remove image",

    // ── Image budget ────────────────────────────────────────────
    "imageBudget.good.label": "Good for AI",
    "imageBudget.good.detail": "This image is light enough for reliable OCR + synthesis.",
    "imageBudget.good.recommendation": "Target met: <=700 KB and <=1400 px longest side.",
    "imageBudget.warning.label": "Acceptable but heavier",
    "imageBudget.warning.detail": "This image should usually work, but synthesis may be slower.",
    "imageBudget.warning.recommendation":
      "Best target: <=700 KB. Acceptable ceiling: <=1.2 MB and <=1600 px.",
    "imageBudget.heavy.label": "Heavy for AI",
    "imageBudget.heavy.detail":
      "This screenshot is likely to increase timeout risk during synthesis.",
    "imageBudget.heavy.recommendation":
      "Resize/compress to <=700 KB if possible, maximum <=1.2 MB for reliable runs.",

    // ── Forensic lightbox UI ────────────────────────────────────
    "forensic.dialogTitle": "Forensic screenshot analysis",
    "forensic.title": "Forensic scan",
    "forensic.closeAria": "Close forensic view",
    "forensic.leftPanel": "Left · Structure",
    "forensic.rightPanel": "Right · Actions",
    "forensic.scanning": "Scanning pixels…",
    "forensic.zonesHeading": "UI zones",
    "forensic.ocrHintsHeading": "OCR hints",
    "forensic.warningsHeading": "Warnings",
    "forensic.noBlockers": "No blockers detected.",
    "forensic.heatmapOn": "Heatmap on",
    "forensic.heatmapOff": "Heatmap off",
    "forensic.presetsHeading": "1-click presets",
    "forensic.fidelity": "Fidelity",
    "forensic.fidelityAria": "Generation fidelity",
    "forensic.fidelityPixelPerfect": "Pixel-perfect",
    "forensic.fidelityBalanced": "Balanced",
    "forensic.fidelitySimplified": "Simplified",
    "forensic.estTokens": "Est. tokens:",
    "forensic.estTime": "Est. time: ~{seconds}s",
    "forensic.target": "Target: {label}",
    "forensic.regionLocked": "Right panel locked to region-only generation.",
    "forensic.generateSection": "Generate this section",
    "forensic.generateFull": "Generate full page",
    "forensic.selectZoneAria": "Select zone: {label}",

    // ── Forensic presets ────────────────────────────────────────
    "forensic.preset.bank.label": "Bank statement",
    "forensic.preset.bank.focusHint": "Optimized for dense tables and numeric columns.",
    "forensic.preset.invoice.label": "Invoice",
    "forensic.preset.invoice.focusHint": "Line items, totals, and header blocks.",
    "forensic.preset.dashboard.label": "Dashboard",
    "forensic.preset.dashboard.focusHint": "Cards, sidebar, and chart regions.",
    "forensic.preset.mobile.label": "Mobile app",
    "forensic.preset.mobile.focusHint": "Mobile-first spacing and stacked layout.",
    "forensic.preset.wordpress.label": "WordPress landing",
    "forensic.preset.wordpress.focusHint": "Header nav, hero, main content blocks, footer menu.",

    // ── Forensic zone labels ────────────────────────────────────
    "forensic.zone.header.label": "Header / top bar",
    "forensic.zone.header.detail": "Navigation, logo, and primary actions likely live here.",
    "forensic.zone.sidebar.label": "Sidebar navigation",
    "forensic.zone.sidebar.detail": "Vertical menu or filter rail detected on the left edge.",
    "forensic.zone.content.label": "Main content",
    "forensic.zone.content.detail": "Primary reading surface — cards, forms, or article body.",
    "forensic.zone.table.label": "Table / grid block",
    "forensic.zone.table.detail":
      "Dense horizontal bands suggest rows, columns, or spreadsheet cells.",
    "forensic.zone.cards.label": "Card cluster",
    "forensic.zone.cards.detail": "Repeated panels with similar visual weight.",
    "forensic.zone.cta.label": "CTA / action rail",
    "forensic.zone.cta.detail": "Buttons or action stack on the right edge.",
    "forensic.zone.footer.label": "Footer",
    "forensic.zone.footer.detail": "Secondary links, legal copy, or pagination.",

    // ── Forensic aspect profiles ────────────────────────────────
    "forensic.aspect.ultraWide": "Ultra-wide document / panorama",
    "forensic.aspect.desktopLandscape": "Desktop landscape UI",
    "forensic.aspect.mobilePortrait": "Mobile portrait screen",
    "forensic.aspect.tallMobile": "Tall mobile / narrow layout",
    "forensic.aspect.balanced": "Balanced app canvas",

    // ── Forensic OCR hints ──────────────────────────────────────
    "forensic.ocr.canvas": "Canvas {width}×{height} — OCR runs on full image at generation time.",
    "forensic.ocr.zonesMapped": "{count} structural zones mapped for targeted prompts.",
    "forensic.ocr.tableDensity": "Table-like density — preserve column alignment in HTML.",
    "forensic.ocr.headerStrip": "Header strip — extract nav labels and logo alt text.",
    "forensic.ocr.sidebarNav": "Sidebar — use <nav> and list semantics.",

    // ── Forensic warnings ───────────────────────────────────────
    "forensic.warning.heavyFile.title": "Heavy for AI pipeline",
    "forensic.warning.heavyFile.detail": "{detail}",
    "forensic.warning.warnFile.title": "Slower synthesis likely",
    "forensic.warning.warnFile.detail": "{detail}",
    "forensic.warning.wideLayout.title": "Very wide layout",
    "forensic.warning.wideLayout.detail":
      "Consider cropping to the main content column before generation.",
    "forensic.warning.lowContrast.title": "Bright UI detected",
    "forensic.warning.lowContrast.detail":
      "Low-contrast gray text may be harder to OCR — enable Strict accessibility.",
    "forensic.warning.oversized.title": "Long edge above 1600px",
    "forensic.warning.oversized.detail":
      "Auto-compression helps, but resizing improves OCR accuracy.",

    // ── Generation options ──────────────────────────────────────
    "options.output.label": "Output",
    "options.output.static": "Static HTML + CSS",
    "options.output.singleFile": "Single-file HTML",
    "options.output.tailwind": "Tailwind",
    "options.output.component": "Component-style",
    "options.styling.label": "Styling",
    "options.styling.vanillaCss": "Vanilla CSS",
    "options.styling.cssModules": "CSS Modules",
    "options.styling.tailwind": "Tailwind classes",
    "options.styling.inlineCss": "Inline styles",
    "options.responsiveness.label": "Responsiveness",
    "options.responsiveness.mobileFirst": "Mobile-first",
    "options.responsiveness.desktopFirst": "Desktop-first",
    "options.responsiveness.adaptive": "Adaptive",
    "options.accessibility.label": "Accessibility",
    "options.accessibility.standard": "Standard",
    "options.accessibility.strict": "Strict (WCAG AA)",
    "options.extraInstructions.label": "Extra instructions (optional)",
    "options.extraInstructions.placeholder": "Customize the generation behavior…",
    "options.defaultInstructions":
      "Recreate the screenshot as closely as possible. Preserve layout, spacing, colors, typography, visible text, buttons, cards, forms, and navigation. Do not invent unrelated content.",

    // ── Index route ─────────────────────────────────────────────
    "index.generateHtml": "Generate HTML",
    "index.generating": "Generating...",
    "index.continueGeneration": "Continue code generation",
    "index.continuing": "Continuing...",
    "index.generatedOutput": "Generated output",
    "index.savedToProjects": "Saved to Projects",
    "index.saveToProjectsFailed.title": "Could not save to Projects",
    "index.saveToProjectsFailed.description":
      "Your generated output is still available here, but saving to browser storage failed. This often happens when local storage is full — try removing old projects.",
    "index.viewInProjects": "View in Projects",
    "index.newUpload": "New upload",
    "index.loadedProject.hint":
      "Opened from Projects · {fileName} · continue refining or generate from a new screenshot",
    "index.loadedProject.clear": "Clear",
    "index.error.phase": "Phase:",
    "index.error.likelyCause": "Likely cause:",
    "index.error.suggestedFix": "Suggested fix:",
    "index.error.tryAgain": "Try again",

    // ── Generation phases ───────────────────────────────────────
    "phase.validating": "Validation",
    "phase.rate_limited_check": "Rate limit",
    "phase.uploading_to_blob": "Image upload",
    "phase.ocr": "OCR",
    "phase.synthesizing": "Synthesis",
    "phase.json_repair": "JSON repair",
    "phase.sanitizing": "Sanitizing",
    "phase.done": "Done",
    "phase.failed": "Failed",

    "phase.message.validating": "Validating image and options...",
    "phase.message.rate_limited_check": "Checking usage limits...",
    "phase.message.uploading_to_blob": "Preparing image for OCR...",
    "phase.message.ocr": "Reading text and structure from the screenshot...",
    "phase.message.synthesizing": "Generating semantic HTML and CSS...",
    "phase.message.json_repair": "Repairing AI JSON output...",
    "phase.message.sanitizing": "Preparing safe preview output...",
    "phase.message.done": "Generation complete.",
    "phase.message.failed": "Generation failed.",
    "phase.message.continuing": "Continuing code generation...",
    "phase.message.refining": "Applying your refinement...",

    // ── Loading steps ───────────────────────────────────────────
    "loading.step.validating": "Validating input",
    "loading.step.rate_limited_check": "Checking usage limits",
    "loading.step.uploading_to_blob": "Preparing image for OCR",
    "loading.step.ocr": "Reading screenshot text and structure",
    "loading.step.synthesizing": "Generating semantic HTML and CSS",
    "loading.step.json_repair": "Repairing structured output if needed",
    "loading.step.sanitizing": "Preparing safe preview output",
    "loading.step.done": "Done",
    "loading.progressNote": "Progress reflects completed pipeline phases, not a model timer.",
    "loading.refinementProgressAria": "Refinement progress",
    "loading.generationProgressAria": "Generation progress",

    // ── Refinement box ──────────────────────────────────────────
    "refinement.chip.improveFidelity": "Improve fidelity",
    "refinement.chip.makeResponsive": "Make responsive",
    "refinement.chip.improveSemantics": "Improve semantics",
    "refinement.chip.simplifyWrappers": "Simplify wrappers",
    "refinement.chip.convertTailwind": "Convert to Tailwind",
    "refinement.chip.optimizeSeo": "Optimize SEO",
    "refinement.inputAria": "Refinement instruction",
    "refinement.placeholder": "Refine the generated code…",
    "refinement.button": "Refine",

    // ── Result tabs / code / preview ────────────────────────────
    "result.tab.preview": "Preview",
    "result.tab.html": "HTML",
    "result.tab.css": "CSS",
    "result.tab.js": "JS",
    "result.tab.notes": "Notes",
    "result.runJsInPreview": "Run JS in preview",
    "result.downloadHtml": ".html",
    "result.notes.explanation": "Explanation",
    "result.notes.accessibility": "Accessibility",
    "result.notes.responsive": "Responsive",
    "result.notes.assumptions": "Assumptions",
    "result.notes.warnings": "Warnings",
    "result.previewFrameTitle": "Generated HTML preview",
    "result.previewJsWarning":
      "JavaScript preview enabled — generated code runs in an isolated sandbox.",
    "result.code.copyAria": "Copy code",
    "result.code.copy": "Copy",
    "result.code.copyFailed": "Could not copy to clipboard",
    "result.code.copied": "Copied",
    "result.code.empty": "// empty",

    // ── Capability cards & trust strip ────────────────────────────
    "capability.aria": "Capabilities",
    "capability.screenshot.title": "Screenshot to HTML",
    "capability.screenshot.description":
      "Drop a UI screenshot and get clean, editable HTML and CSS.",
    "capability.document.title": "Document to HTML",
    "capability.document.description": "Recreate invoices, statements, forms, and A4 layouts.",
    "capability.refine.title": "Refine with AI",
    "capability.refine.description":
      "Improve fidelity, spacing, semantics, and print styles by instruction.",
    "capability.export.title": "Export Anywhere",
    "capability.export.description":
      "Download standalone HTML, copy code, or continue in your stack.",
    "trust.aria": "Trusted by",
    "trust.heading": "Trusted by engineers and designers at",
    "trust.productTeams": "Product teams",
    "trust.agencies": "Agencies",
    "trust.indieBuilders": "Indie builders",
    "trust.designEngineers": "Design engineers",

    // ── Projects page ───────────────────────────────────────────
    "projects.title": "Projects",
    "projects.subtitle": "Your saved screenshot-to-HTML generations in this browser.",
    "projects.storage": "{count} projects · {size} stored locally",
    "projects.storageOne": "1 project · {size} stored locally",
    "projects.storageMode.localStorage": "Local storage",
    "projects.storageMode.indexedDB": "Browser database",
    "projects.fallbackActivated.title": "Using browser database storage",
    "projects.fallbackActivated.description":
      "Projects are now stored in browser database because local storage is full.",
    "projects.migrationPersistFailed.title": "Could not upgrade saved projects",
    "projects.migrationPersistFailed.description":
      "Your projects were loaded in memory, but writing the upgraded format to browser storage failed. This often happens when local storage is full — try removing old projects.",
    "projects.persistFailed.title": "Could not save project changes",
    "projects.persistFailed.description":
      "Your change was not written to browser storage. This often happens when local storage is full — try removing old projects.",
    "projects.newProject": "New project",
    "projects.empty.title": "No projects yet",
    "projects.empty.description":
      "Upload a screenshot on New and generate HTML — each successful run is saved here automatically.",
    "projects.empty.cta": "Create first project",
    "projects.noMatch": "No projects match “{query}”.",

    // ── Projects toolbar ────────────────────────────────────────
    "projects.toolbar.searchPlaceholder": "Search projects…",
    "projects.toolbar.searchAria": "Search projects",
    "projects.toolbar.sortAria": "Sort projects",
    "projects.toolbar.sort.updated": "Recently updated",
    "projects.toolbar.sort.created": "Recently created",
    "projects.toolbar.sort.name": "Name A–Z",

    // ── Project card ────────────────────────────────────────────
    "projectCard.lines": "{htmlLines} HTML · {cssLines} CSS",
    "projectCard.updated": "Updated {date}",

    // ── Project detail ──────────────────────────────────────────
    "projectDetail.notFound.title": "Project not found",
    "projectDetail.notFound.description":
      "It may have been deleted or never saved to this browser.",
    "projectDetail.backToProjects": "Back to projects",
    "projectDetail.allProjects": "All projects",
    "projectDetail.nameAria": "Project name",
    "projectDetail.save": "Save",
    "projectDetail.cancel": "Cancel",
    "projectDetail.renameAria": "Rename project",
    "projectDetail.meta": "{fileName} · {width}×{height} · Updated {date}",
    "projectDetail.openInEditor": "Open in editor",
    "projectDetail.delete": "Delete",
    "projectDetail.deleteConfirm": "Delete “{name}”? This cannot be undone.",
    "projectDetail.zoomTitle": "Click to zoom",
    "projectDetail.zoomAria": "Zoom screenshot: {fileName}",
    "projectDetail.thumbAlt": "Screenshot thumbnail",
    "projectDetail.lightboxAlt": "Project screenshot full size",
    "projectDetail.output": "Output:",
    "projectDetail.styling": "Styling:",
    "projectDetail.lines": "Lines:",
    "projectDetail.linesDetail": "{htmlLines} HTML · {cssLines} CSS",
    "projectDetail.linesWithJs": "{htmlLines} HTML · {cssLines} CSS · {jsLines} JS",
    "projectDetail.created": "Created:",
    "projectDetail.generatedOutput": "Generated output",

    // ── Builder workspace ───────────────────────────────────────
    "builder.brand": "VibeCraft",
    "builder.brandSubtitle": "Builder",
    "builder.newApplication": "New Application",
    "builder.categories": "Categories",
    "builder.starterTemplates": "Starter Templates",
    "builder.byokReady": "BYOK Ready",
    "builder.serverAiReady": "Server AI ready",
    "builder.demoMode": "Demo Mode",
    "builder.mistralKeysSet": "Mistral keys set",
    "builder.serverKeysConfigured": "MISTRAL_API_KEY from server env",
    "builder.serverWithOptionalByok": "Server env active — browser BYOK is optional",
    "builder.templatesOnly": "Templates only",
    "builder.settingsAria": "Settings",
    "builder.workspaceTitle": "Workspace Studio",
    "builder.mobile.aiReadyTitle": "VibeCraft AI Ready",
    "builder.mobile.aiReadyHint":
      "Select a starter template or describe your application to generate a single-file interactive layout.",
    "builder.mobile.viewAll": "View all",
    "builder.mobile.newBadge": "New",
    "builder.mobile.activeProject": "Active Project",
    "builder.mobile.untitledProject": "Untitled project",
    "builder.mobile.live": "Live",
    "builder.mobile.deviceIphone17Air": "iPhone 17 Air (375px)",
    "builder.mobile.refreshPreview": "Refresh preview",
    "builder.mobile.runPreview": "Run preview",
    "builder.mobile.tabFiles": "Files",
    "builder.mobile.tabSettings": "Settings",
    "builder.mobile.tabFilesSoon": "Coming soon",
    "builder.mobile.comingSoon": "Coming soon",
    "builder.mobile.menuAria": "Open navigation menu",
    "builder.mobile.navTitle": "Navigation",
    "builder.mobile.copyCode": "Copy code",
    "builder.mobile.viewAllAria": "Show all starter templates",
    "builder.mode.build": "Build",
    "builder.mode.buildHint": "Create a new standalone app",
    "builder.mode.refine": "Refine",
    "builder.mode.refineHint": "Change the current app",
    "builder.mode.fix": "Fix",
    "builder.mode.fixHint": "Repair the current app",
    "builder.mode.explain": "Explain",
    "builder.mode.explainHint": "Explain without changing code",
    "builder.inputPlaceholder": "Build, refine, fix, or explain...",
    "builder.action.cancelGeneration": "Cancel generation",
    "builder.action.sendPrompt": "Send prompt",
    "builder.inputWorking": "AI is working...",
    "builder.previewTab": "Live Preview",
    "builder.codeTab": "Code",
    "builder.source.empty": "empty",
    "builder.source.demo": "demo",
    "builder.source.ai": "ai",
    "builder.source.manual": "manual",
    "builder.unsavedMarker": " *",
    "builder.historyAria": "Restore revision",
    "builder.historyOption": "History ({count})",
    "builder.saveManual": "Save",
    "builder.copy": "Copy",
    "builder.copied": "Copied",
    "builder.download": "Download",
    "builder.securityWarning": "Security Warning",
    "builder.previewJsRiskConfirm":
      "Security warnings were detected in this HTML. Enable JavaScript preview only if you trust the generated code.",
    "builder.previewEmptyTitle": "Preview Monitor",
    "builder.previewEmptyHint": "Generated apps render interactively here.",
    "builder.previewFrameTitle": "VibeCraft Preview",
    "builder.codeEditorAria": "HTML editor",
    "builder.errorPrefix": "Error:",

    // Builder categories
    "builder.category.portfolios": "Portfolios & Resumes",
    "builder.category.landing": "Landing Pages",
    "builder.category.tools": "Utility Tools",
    "builder.category.games": "Interactive Games",
    "builder.category.dashboards": "Dashboards",

    // Builder template titles & descriptions (by id)
    "builder.template.snake-game.title": "Retro Snake Game",
    "builder.template.snake-game.description":
      "Fully playable classic Snake game with retro canvas aesthetics, score tracker, and mobile controls.",
    "builder.template.tic-tac-toe.title": "Tic-Tac-Toe vs Smart AI",
    "builder.template.tic-tac-toe.description":
      "Play Tic-Tac-Toe against an AI opponent featuring smooth scaling grid items and winning animation.",
    "builder.template.memory-game.title": "Neon Card Memory Match",
    "builder.template.memory-game.description":
      "A flip-and-match cards game featuring cyberpunk-themed symbols, animations, and matching streaks.",
    "builder.template.pomodoro-timer.title": "Circular Pomodoro Hub",
    "builder.template.pomodoro-timer.description":
      "Sleek dark glassmorphism layout with custom session intervals, circular SVG countdown, and audio alerts.",
    "builder.template.photo-portfolio.title": "Photographer Lightbox Showcase",
    "builder.template.photo-portfolio.description":
      "Minimal gallery featuring high contrast grid layout, dynamic photo categories, and responsive image viewer overlay.",
    "builder.template.kanban-board.title": "Flow Kanban Task Board",
    "builder.template.kanban-board.description":
      "A workspace tracker with drag-like button moves, dynamic task creation, and responsive layout.",
    "builder.template.wordpress-landing.title": "WordPress Marketing Landing",
    "builder.template.wordpress-landing.description":
      "Semantic WordPress-style page with header nav, hero CTA, feature blocks, testimonial strip, and footer menu.",

    // Builder steps & status
    "builder.step.connect": "Connect & analyze",
    "builder.step.synthesize": "Synthesize HTML",
    "builder.step.css": "Generate CSS",
    "builder.step.scripts": "Compile scripts",
    "builder.status.initializingBuild": "Initializing build...",
    "builder.status.starting": "Starting {mode}...",
    "builder.status.connecting": "Connecting...",
    "builder.status.building": "Building a new app...",
    "builder.status.preparingRefine": "Preparing current app for refinement...",
    "builder.status.inspectingFix": "Inspecting current app for targeted fixes...",
    "builder.status.readingExplain": "Reading current app for explanation...",
    "builder.status.generatingHtml": "Generating HTML...",
    "builder.status.planningArchitecture": "Planning architecture...",
    "builder.status.buildingHtml": "Building HTML...",
    "builder.status.reviewingRepairing": "Reviewing and repairing...",
    "builder.status.buildingVariants": "Building candidate variants...",
    "builder.status.judgingCandidates": "Judging candidates...",
    "builder.status.cancelled": "Generation cancelled",
    "builder.status.cancelling": "Cancelling generation…",
    "builder.status.preparingExplanation": "Preparing explanation...",
    "builder.status.finalizing": "Finalizing...",
    "builder.status.complete": "Complete!",
    "builder.status.done": "Done",
    "builder.status.failed": "Failed",
    "builder.status.loadingTemplate": "Loading offline template...",
    "builder.status.explanationReady": "Explanation ready.",

    // Builder chat messages
    "builder.background.complete": "VibeCraft generation finished",
    "builder.background.completeHint": "Your workspace was updated while you were away.",
    "builder.background.openBuilder": "Open Builder",
    "builder.background.failed": "VibeCraft generation failed",
    "builder.background.failedHint": "Open Builder to review the error and try again.",
    "builder.chat.greet":
      "VibeCraft AI Ready. Select a starter template or describe your application to generate a single-file interactive layout.",
    "builder.chat.newWorkspace": "New workspace. Pick a template or describe your layout.",
    "builder.chat.fixReply": "Applied fix — preview updated.",
    "builder.chat.refineReply": "Updated app — preview reflects your change.",
    "builder.chat.generateOnline": 'Generated! Check "Live Preview" or "Code".',
    "builder.chat.generateOffline":
      "Loaded offline demo. Add Mistral keys in Settings for custom AI builds.",
    "builder.chat.generationFailed": "Generation failed. See error below.",
    "builder.chat.restored": "Restored: {label}.",

    // Builder version labels
    "builder.version.aiFix": "AI Fix",
    "builder.version.aiRefinement": "AI Refinement",
    "builder.version.aiGeneration": "AI Generation",
    "builder.version.demoTemplate": "Demo Template",
    "builder.version.manualEdit": "Manual Edit",

    // Builder settings dialog
    "builder.settings.title": "Mistral BYOK",
    "builder.settings.description":
      "Optional browser keys (BYOK). If MISTRAL_API_KEY is in .env.local, server AI is used automatically.",
    "builder.settings.statusByok": "BYOK keys active in this browser.",
    "builder.settings.statusServer":
      "Server AI is active from .env.local — BYOK in this dialog is optional.",
    "builder.settings.statusServerWithByok":
      "Server AI from .env.local is used first. Clear invalid BYOK keys below to avoid 401 errors.",
    "builder.settings.statusDemo":
      "No AI keys detected. Add MISTRAL_API_KEY to .env.local or paste a Mistral key below.",
    "builder.settings.saveSuccess": "Mistral keys saved for this browser.",
    "builder.settings.saveMissingKey": "Enter API Key 1 before saving.",
    "builder.settings.key1": "API Key 1",
    "builder.settings.key2": "API Key 2 (fallback)",
    "builder.settings.key2Hint": "Used if Key 1 fails.",
    "builder.settings.model": "Model",
    "builder.settings.modelLarge": "Mistral Large",
    "builder.settings.modelMedium": "Mistral Medium",
    "builder.settings.modelCodestral": "Codestral",
    "builder.settings.orchestrationMode": "Builder mode",
    "builder.settings.orchestration.fast.label": "Fast",
    "builder.settings.orchestration.fast.badge": "1 call",
    "builder.settings.orchestration.fast.description":
      "Fastest mode. One AI call. Good for quick tests and simple edits.",
    "builder.settings.orchestration.fast.calls": "1× AI call",
    "builder.settings.orchestration.pro.label": "Pro",
    "builder.settings.orchestration.pro.badge": "Default",
    "builder.settings.orchestration.pro.description":
      "Planner → Builder → Reviewer. Best default balance of quality, cost, and time.",
    "builder.settings.orchestration.pro.calls": "3× AI calls",
    "builder.settings.orchestration.beast.label": "Beast",
    "builder.settings.orchestration.beast.badge": "Max quality",
    "builder.settings.orchestration.beast.description":
      "Planner → Builder A + B → Judge → Reviewer. Higher quality, slower, more API usage.",
    "builder.settings.orchestration.beast.calls": "5× AI calls",
    "builder.settings.orchestration.beast.warning":
      "Uses more AI calls. Best for final visuals, landing pages, and client demos.",
    "builder.settings.orchestration.beastConfirmTitle": "Enable Beast mode?",
    "builder.settings.orchestration.beastConfirmDescription":
      "Beast mode uses more AI calls and may be slower. It is best for final visuals, landing pages, and client demos.",
    "builder.settings.orchestration.beastConfirmAction": "Use Beast mode",
    "builder.settings.orchestration.beastConfirmCancel": "Stay on current mode",
    "builder.trace.title": "Generation trace",
    "builder.trace.total": "Total",
    "builder.trace.mode": "Mode",
    "builder.trace.status.pending": "Pending",
    "builder.trace.status.running": "Running",
    "builder.trace.status.success": "Success",
    "builder.trace.status.failed": "Failed",
    "builder.trace.status.cancelled": "Cancelled",
    "builder.trace.status.skipped": "Skipped",
    "builder.trace.step.planning": "Planning",
    "builder.trace.step.building": "Building",
    "builder.trace.step.buildingA": "Building A",
    "builder.trace.step.buildingB": "Building B",
    "builder.trace.step.judging": "Judging",
    "builder.trace.step.reviewing": "Reviewing",
    "builder.trace.step.finalizing": "Finalizing",
    "builder.trace.retrying": "Retrying",
    "builder.trace.retriedOnce": "retried once",
    "builder.trace.retryCount": "Retries: {count}",
    "builder.trace.lastError": "Last error",
    "builder.trace.timedOut": "Timed out",
    "builder.trace.timeoutAfter": "Timed out after {duration}",
    "builder.trace.fallbackUsed": "Fallback used",
    "builder.trace.waitingToRetry": "Waiting to retry",
    "builder.trace.retryDelay": "Retry delay",
    "builder.metrics.aiCalls": "AI calls",
    "builder.metrics.retries": "Retries",
    "builder.metrics.timeouts": "Timeouts",
    "builder.metrics.fallbacks": "Fallbacks",
    "builder.profile.title": "Quality profile",
    "builder.profile.auto.label": "Auto",
    "builder.profile.auto.description":
      "Automatically chooses the best style profile from your prompt keywords.",
    "builder.profile.premiumSaas.label": "Premium SaaS",
    "builder.profile.premiumSaas.description":
      "Modern premium SaaS look with polished cards, hierarchy, and professional UI.",
    "builder.profile.neonParallax.label": "Neon Parallax",
    "builder.profile.neonParallax.description":
      "Best for futuristic neon, 3D depth, parallax, and cinematic showcases.",
    "builder.profile.appleGlass.label": "Apple Glass",
    "builder.profile.appleGlass.description":
      "Apple-like glass surfaces, liquid gradients, soft shadows, and refined spacing.",
    "builder.profile.dashboardPro.label": "Dashboard Pro",
    "builder.profile.dashboardPro.description":
      "Serious dashboard with data cards, tables, filters, and responsive admin shell.",
    "builder.profile.pwaMobile.label": "PWA Mobile",
    "builder.profile.pwaMobile.description":
      "Mobile-first app shell with safe-area support and touch-friendly controls.",
    "builder.profile.wordpressLanding.label": "WordPress Landing",
    "builder.profile.wordpressLanding.description":
      "WordPress or plugin business landing with feature blocks, proof, and CTA sections.",
    "builder.profile.luxuryBrand.label": "Luxury Brand",
    "builder.profile.luxuryBrand.description":
      "Premium luxury identity with editorial spacing and cinematic hero presentation.",
    "builder.profile.minimalClean.label": "Minimal Clean",
    "builder.profile.minimalClean.description":
      "Clean minimal interface with precise spacing and reduced visual noise.",
    "builder.profile.recommendedMode": "Recommended",
    "builder.profile.fastWarning": "This profile works best with Pro or Beast.",
    "builder.health.title": "HTML Health",
    "builder.health.profile": "Profile",
    "builder.health.minimumExpectedScore": "Minimum expected score",
    "builder.health.score": "Score",
    "builder.health.critical": "Critical",
    "builder.health.warning": "Warning",
    "builder.health.info": "Info",
    "builder.health.noIssues": "No issues detected.",
    "builder.health.showDetails": "Show findings",
    "builder.health.hideDetails": "Hide findings",
    "builder.health.applyPolishFix": "Apply motion, focus & responsive fix",
    "builder.health.applyPolishFixHint":
      "Loads a Fix prompt for reduced-motion, focus-visible, and responsive breakpoints",
    "builder.health.category.structure": "Structure",
    "builder.health.category.security": "Security",
    "builder.health.category.accessibility": "Accessibility",
    "builder.health.category.responsive": "Responsive",
    "builder.health.category.motion": "Motion",
    "builder.health.category.visual": "Visual",
    "builder.health.category.javascript": "JavaScript",
    "builder.health.category.parallax": "Parallax / 3D",
    "builder.health.category.performance": "Performance",
    "builder.health.chip.viewport": "Viewport",
    "builder.health.chip.reducedMotion": "Reduced motion",
    "builder.health.chip.mediaQueries": "Media queries",
    "builder.health.chip.cssVariables": "CSS variables",
    "builder.health.chip.externalScripts": "Remote scripts",
    "builder.health.finding.missingDoctype.title": "Missing DOCTYPE",
    "builder.health.finding.missingDoctype.message":
      "HTML should start with <!DOCTYPE html> for predictable rendering.",
    "builder.health.finding.missingHtml.title": "Missing <html>",
    "builder.health.finding.missingHtml.message": "Document is missing the root <html> element.",
    "builder.health.finding.missingHead.title": "Missing <head>",
    "builder.health.finding.missingHead.message": "Document is missing a <head> section.",
    "builder.health.finding.missingBody.title": "Missing <body>",
    "builder.health.finding.missingBody.message": "Document is missing a <body> section.",
    "builder.health.finding.missingTitle.title": "Missing <title>",
    "builder.health.finding.missingTitle.message": "Page has no <title> element.",
    "builder.health.finding.markdownFences.title": "Markdown fences detected",
    "builder.health.finding.markdownFences.message":
      "Generated output still contains markdown code fences instead of raw HTML.",
    "builder.health.finding.externalScript.title": "External script",
    "builder.health.finding.externalScript.message":
      "A remote <script src> was found. Prefer inline or trusted local scripts.",
    "builder.health.finding.inlineRemoteImport.title": "Remote module import",
    "builder.health.finding.inlineRemoteImport.message": "JavaScript imports a remote module URL.",
    "builder.health.finding.evalUsage.title": "eval() usage",
    "builder.health.finding.evalUsage.message": "eval() is a high-risk dynamic execution pattern.",
    "builder.health.finding.newFunctionUsage.title": "new Function() usage",
    "builder.health.finding.newFunctionUsage.message":
      "Dynamic Function construction is risky in generated apps.",
    "builder.health.finding.documentWrite.title": "document.write() usage",
    "builder.health.finding.documentWrite.message":
      "document.write() can break rendering and is unsafe in modern apps.",
    "builder.health.finding.suspiciousInnerHtml.title": "innerHTML assignment",
    "builder.health.finding.suspiciousInnerHtml.message":
      "innerHTML assignment detected. Verify content is sanitized.",
    "builder.health.finding.javascriptUrl.title": "javascript: URL",
    "builder.health.finding.javascriptUrl.message": "A javascript: URL was found in the document.",
    "builder.health.finding.remoteTrackingPixel.title": "Remote tracking pixel",
    "builder.health.finding.remoteTrackingPixel.message":
      "A remote 1×1 image suggests a tracking pixel.",
    "builder.health.finding.remoteIframe.title": "Remote iframe",
    "builder.health.finding.remoteIframe.message": "A remote iframe embed was detected.",
    "builder.health.finding.selectorNoMatch.title": "Selector may not match",
    "builder.health.finding.selectorNoMatch.message":
      "A querySelector/getElementById target was not found in the static HTML.",
    "builder.health.finding.unguardedEventListener.title": "Unguarded event listener",
    "builder.health.finding.unguardedEventListener.message":
      "An event listener is attached without a null guard.",
    "builder.health.finding.missingViewport.title": "Missing viewport meta",
    "builder.health.finding.missingViewport.message":
      "No viewport meta tag found for responsive scaling.",
    "builder.health.finding.noMediaQueriesMultiSection.title": "No media queries",
    "builder.health.finding.noMediaQueriesMultiSection.message":
      "Multi-section layout has no @media rules for smaller screens.",
    "builder.health.finding.fixedLargeWidths.title": "Fixed large widths",
    "builder.health.finding.fixedLargeWidths.message":
      "Multiple fixed widths above 900px may break mobile layouts.",
    "builder.health.finding.mobileHostileWidth.title": "Mobile-hostile width",
    "builder.health.finding.mobileHostileWidth.message":
      "A main container uses a fixed 1200px width.",
    "builder.health.finding.animationWithoutReducedMotion.title": "Motion without reduced-motion",
    "builder.health.finding.animationWithoutReducedMotion.message":
      "Animations exist but no prefers-reduced-motion fallback was found.",
    "builder.health.finding.tooManyInfiniteAnimations.title": "Many infinite animations",
    "builder.health.finding.tooManyInfiniteAnimations.message":
      "Multiple infinite animations may hurt performance and accessibility.",
    "builder.health.finding.emptyButton.title": "Empty button",
    "builder.health.finding.emptyButton.message": "A button has no visible text or aria-label.",
    "builder.health.finding.interactiveNoLabel.title": "Unlabeled control",
    "builder.health.finding.interactiveNoLabel.message":
      "An interactive element lacks visible text or accessible name.",
    "builder.health.finding.iconOnlyNoAria.title": "Icon-only control",
    "builder.health.finding.iconOnlyNoAria.message":
      "An icon-only button or link needs an aria-label.",
    "builder.health.finding.imageMissingAlt.title": "Image missing alt",
    "builder.health.finding.imageMissingAlt.message": "At least one image is missing alt text.",
    "builder.health.finding.noFocusStyles.title": "No focus styles",
    "builder.health.finding.noFocusStyles.message":
      "Interactive UI exists but no focus/focus-visible styles were detected.",
    "builder.health.finding.promptNeonMissing.title": "Neon visuals missing",
    "builder.health.finding.promptNeonMissing.message":
      "Prompt asked for neon styling but output lacks neon/glow markers.",
    "builder.health.finding.promptGlassMissing.title": "Glass visuals missing",
    "builder.health.finding.promptGlassMissing.message":
      "Prompt asked for glass styling but backdrop-filter/glass markers are missing.",
    "builder.health.finding.promptParallaxMissing.title": "Parallax/3D visuals missing",
    "builder.health.finding.promptParallaxMissing.message":
      "Prompt asked for parallax or 3D but perspective/depth markers are missing.",
    "builder.health.finding.promptPremiumMissing.title": "Premium visuals missing",
    "builder.health.finding.promptPremiumMissing.message":
      "Prompt asked for premium/wow visuals but polish markers are thin.",
    "builder.health.finding.parallaxTopLeftNoPosition.title": "Offset without positioning",
    "builder.health.finding.parallaxTopLeftNoPosition.message":
      "top/left offsets appear without position:absolute/relative/fixed/sticky.",
    "builder.health.finding.transformStyleNoPerspective.title": "preserve-3d without perspective",
    "builder.health.finding.transformStyleNoPerspective.message":
      "transform-style: preserve-3d is used without a perspective context.",
    "builder.health.finding.pointerParallaxNoReducedMotion.title":
      "Pointer parallax without fallback",
    "builder.health.finding.pointerParallaxNoReducedMotion.message":
      "Mouse-driven parallax lacks prefers-reduced-motion support.",
    "builder.health.finding.parallaxMissingPerspective.title": "Parallax depth missing",
    "builder.health.finding.parallaxMissingPerspective.message":
      "Parallax/3D intent detected but perspective or preserve-3d is missing.",
    "builder.health.finding.excessiveParticles.title": "Heavy particle count",
    "builder.health.finding.excessiveParticles.message":
      "A large number of particles/dots may hurt performance.",
    "builder.health.finding.excessiveBoxShadow.title": "Many box shadows",
    "builder.health.finding.excessiveBoxShadow.message":
      "Excessive glow/shadow layers may increase paint cost.",
    "builder.health.finding.willChangeOveruse.title": "will-change overuse",
    "builder.health.finding.willChangeOveruse.message":
      "Too many will-change declarations can waste GPU memory.",
    "builder.health.finding.profile.minimumScoreNotMet.title": "Below profile minimum score",
    "builder.health.finding.profile.minimumScoreNotMet.message":
      "HTML health score is below the selected profile minimum expectation.",
    "builder.health.finding.profile.reducedMotionExpected.title": "Reduced motion expected",
    "builder.health.finding.profile.reducedMotionExpected.message":
      "This profile expects prefers-reduced-motion support when motion is used.",
    "builder.health.finding.profile.mediaQueriesExpected.title": "Media queries expected",
    "builder.health.finding.profile.mediaQueriesExpected.message":
      "This profile expects responsive @media rules for smaller screens.",
    "builder.health.finding.profile.cssVariablesExpected.title": "CSS variables expected",
    "builder.health.finding.profile.cssVariablesExpected.message":
      "This profile expects CSS custom properties for theming and polish.",
    "builder.health.finding.profile.externalScriptsNotAllowed.title":
      "External scripts not allowed",
    "builder.health.finding.profile.externalScriptsNotAllowed.message":
      "This profile does not allow remote script sources in the output.",
    "builder.error.timeout": "Step exceeded the time limit.",
    "builder.error.step.connecting": "Connection failed",
    "builder.error.step.planning": "Planner failed",
    "builder.error.step.building": "Builder failed",
    "builder.error.step.reviewing": "Reviewer failed",
    "builder.error.step.judging": "Judge failed",
    "builder.error.step.explaining": "Explanation failed",
    "builder.error.step.finalizing": "Finalization failed",
    "builder.error.cancelled": "Generation cancelled.",
    "builder.settings.showKeys": "Show",
    "builder.settings.hideKeys": "Hide",
    "builder.settings.keysSuffix": "Keys",
    "builder.settings.cancel": "Cancel",
    "builder.settings.save": "Save",

    // Builder risk scanner
    "builder.risk.externalScript": "External script",
    "builder.risk.inlineHandlers": "Inline event handlers",
    "builder.risk.nestedIframe": "Nested iframe",
    "builder.risk.possibleSecret": "Possible secret",
    "builder.risk.inlineHandlersDetail": "{count} handler attribute(s) found",
    "builder.risk.nestedIframeDetail": "Generated HTML contains an iframe element",
    "builder.risk.possibleSecretDetail":
      "Code contains a string that resembles an API key or token",

    // ── Root 404 / error pages ──────────────────────────────────
    "error404.title": "404",
    "error404.heading": "Page not found",
    "error404.description": "The page you're looking for doesn't exist or has been moved.",
    "error404.goHome": "Go home",
    "errorPage.heading": "This page didn't load",
    "errorPage.description":
      "Something went wrong on our end. You can try refreshing or head back home.",
    "errorPage.tryAgain": "Try again",
    "errorPage.goHome": "Go home",

    // ── Document meta (title / SEO) ─────────────────────────────
    "meta.root.title": "PNGtoHTMLapp — Screenshot to clean HTML",
    "meta.root.description":
      "Upload a UI screenshot and get clean, semantic HTML and CSS generated by AI. Sandboxed preview, copy, and download.",
    "meta.root.ogTitle": "PNGtoHTMLapp",
    "meta.root.ogDescription": "Turn UI screenshots into clean, semantic HTML with AI.",
    "meta.index.title": "PNGtoHTMLapp — Screenshot to clean HTML",
    "meta.index.description":
      "Upload a UI screenshot and get clean, semantic HTML and CSS generated by AI. Sandboxed preview, copy, and download.",
    "meta.index.ogTitle": "PNGtoHTMLapp",
    "meta.index.ogDescription": "Turn UI screenshots into clean, semantic HTML with AI.",
    "meta.projects.title": "Projects — PNGtoHTMLapp",
    "meta.projects.description": "Browse and manage your screenshot-to-HTML generation projects.",
    "meta.projects.ogTitle": "Projects — PNGtoHTMLapp",
    "meta.projects.ogDescription": "Browse and manage your screenshot-to-HTML generation projects.",
    "meta.builder.title": "VibeCraft Builder — PNGtoHTMLapp",
    "meta.builder.description":
      "Prompt-to-HTML app builder with offline templates, AI generation, sandboxed preview, and revision history.",
    "meta.builder.ogTitle": "VibeCraft Builder — PNGtoHTMLapp",
    "meta.builder.ogDescription":
      "Prompt-to-HTML app builder with offline templates, AI generation, sandboxed preview, and revision history.",

    // ── Diagnostic errors (ApiErrorCode) ────────────────────────
    "diagnostic.INVALID_FILE.title": "Invalid image input",
    "diagnostic.INVALID_FILE.detail": "The uploaded image payload is missing or cannot be read.",
    "diagnostic.INVALID_FILE.likelyCause":
      "The browser sent an empty, corrupted, or unsupported file payload.",
    "diagnostic.INVALID_FILE.suggestedFix":
      "Upload a fresh PNG, JPG, or WebP screenshot and try again.",
    "diagnostic.FILE_TOO_LARGE.title": "Image is too large",
    "diagnostic.FILE_TOO_LARGE.detail": "The image exceeds the configured upload limit.",
    "diagnostic.FILE_TOO_LARGE.likelyCause":
      "The screenshot is larger than the app can safely send to the AI pipeline.",
    "diagnostic.FILE_TOO_LARGE.suggestedFix":
      "Resize or compress the screenshot, then generate again.",
    "diagnostic.UNSUPPORTED_FORMAT.title": "Unsupported image format",
    "diagnostic.UNSUPPORTED_FORMAT.detail": "Only PNG, JPG, and WebP screenshots are accepted.",
    "diagnostic.UNSUPPORTED_FORMAT.likelyCause":
      "The selected file is not one of the supported image MIME types.",
    "diagnostic.UNSUPPORTED_FORMAT.suggestedFix": "Export the screenshot as PNG, JPG, or WebP.",
    "diagnostic.RATE_LIMITED.title": "Rate limit reached",
    "diagnostic.RATE_LIMITED.detail":
      "This IP has sent too many generation requests in a short period.",
    "diagnostic.RATE_LIMITED.likelyCause": "The burst or daily Upstash Redis limit was exceeded.",
    "diagnostic.RATE_LIMITED.suggestedFix":
      "Wait a little before retrying. If this is your deployment, raise RATE_LIMIT_BURST or RATE_LIMIT_DAILY carefully.",
    "diagnostic.MISSING_API_KEY.title": "Mistral API key is missing",
    "diagnostic.MISSING_API_KEY.detail":
      "The server cannot call Mistral because MISTRAL_API_KEY is not configured.",
    "diagnostic.MISSING_API_KEY.likelyCause":
      "The production or preview environment is missing MISTRAL_API_KEY.",
    "diagnostic.MISSING_API_KEY.suggestedFix":
      "Add MISTRAL_API_KEY in Vercel Environment Variables and redeploy.",
    "diagnostic.AI_AUTH_ERROR.title": "Mistral authentication failed",
    "diagnostic.AI_AUTH_ERROR.detail":
      "Mistral rejected the API request with an authentication or permission error.",
    "diagnostic.AI_AUTH_ERROR.likelyCause":
      "The MISTRAL_API_KEY is invalid, expired, missing permissions, or belongs to the wrong account.",
    "diagnostic.AI_AUTH_ERROR.suggestedFix":
      "Rotate the Mistral key, update it in Vercel, and redeploy before retrying.",
    "diagnostic.AI_QUOTA_EXHAUSTED.title": "Mistral quota exhausted",
    "diagnostic.AI_QUOTA_EXHAUSTED.detail":
      "All configured Mistral API keys are rate-limited or out of quota.",
    "diagnostic.AI_QUOTA_EXHAUSTED.likelyCause":
      "The active Mistral key has no remaining quota, and no usable fallback key is configured for this environment.",
    "diagnostic.AI_QUOTA_EXHAUSTED.suggestedFix":
      "Add MISTRAL_API_KEY_FALLBACK or MISTRAL_API_KEYS in Vercel for Production/Preview/Development, or configure MISTRAL_OCR_API_KEY and MISTRAL_CHAT_API_KEY to split OCR and synthesis usage. Redeploy after changing env vars.",
    "diagnostic.MISSING_BLOB_TOKEN.title": "Blob storage token is missing",
    "diagnostic.MISSING_BLOB_TOKEN.detail":
      "The server cannot upload the screenshot because BLOB_READ_WRITE_TOKEN is not configured.",
    "diagnostic.MISSING_BLOB_TOKEN.likelyCause":
      "The Vercel Blob environment variable is missing in this environment.",
    "diagnostic.MISSING_BLOB_TOKEN.suggestedFix":
      "Add BLOB_READ_WRITE_TOKEN in Vercel Environment Variables and redeploy.",
    "diagnostic.BLOB_UPLOAD_FAILED.title": "Image upload failed",
    "diagnostic.BLOB_UPLOAD_FAILED.detail":
      "The screenshot could not be uploaded for OCR processing.",
    "diagnostic.BLOB_UPLOAD_FAILED.likelyCause":
      "Vercel Blob rejected the upload, the token is invalid, or the network request failed.",
    "diagnostic.BLOB_UPLOAD_FAILED.suggestedFix":
      "Check BLOB_READ_WRITE_TOKEN and Vercel Blob status, then retry.",
    "diagnostic.AI_TIMEOUT.title": "AI generation timeout",
    "diagnostic.AI_TIMEOUT.titleOcr": "OCR timeout",
    "diagnostic.AI_TIMEOUT.detail": "The AI provider did not respond before the server timeout.",
    "diagnostic.AI_TIMEOUT.likelyCause":
      "The screenshot may be too large or visually complex, Mistral may be slow, or the network is degraded.",
    "diagnostic.AI_TIMEOUT.suggestedFix":
      "Use a screenshot <=700 KB for best reliability; <=1.2 MB is usually acceptable. Keep the longest side <=1600 px and crop unrelated content.",
    "diagnostic.AI_INVALID_RESPONSE.title": "Invalid AI output",
    "diagnostic.AI_INVALID_RESPONSE.titleOcr": "Unreadable OCR response",
    "diagnostic.AI_INVALID_RESPONSE.detail":
      "The AI provider returned an empty or malformed response.",
    "diagnostic.AI_INVALID_RESPONSE.likelyCause":
      "The screenshot may be ambiguous, or the model returned text that did not match the expected schema.",
    "diagnostic.AI_INVALID_RESPONSE.suggestedFix":
      "Retry with clearer instructions or a cleaner screenshot.",
    "diagnostic.JSON_REPAIR_FAILED.title": "JSON repair failed",
    "diagnostic.JSON_REPAIR_FAILED.detail":
      "The model output could not be repaired into the required JSON schema.",
    "diagnostic.JSON_REPAIR_FAILED.likelyCause":
      "The synthesis model likely produced a response that was too long and got truncated inside a JSON string. The app already tried automatic recovery and repair, but the response was still not usable.",
    "diagnostic.JSON_REPAIR_FAILED.suggestedFix":
      "Retry once with the default preset. If it repeats, remove extra instructions, crop or split a large screenshot, and use Continue generation after any recovered partial result.",
    "diagnostic.SANITIZE_FAILED.title": "Preview sanitization failed",
    "diagnostic.SANITIZE_FAILED.detail":
      "The generated HTML could not be prepared safely for preview.",
    "diagnostic.SANITIZE_FAILED.likelyCause":
      "The generated markup contains invalid or unsafe constructs.",
    "diagnostic.SANITIZE_FAILED.suggestedFix":
      "Retry generation or disable risky custom instructions.",
    "diagnostic.SERVER_ERROR.title": "Unexpected server error",
    "diagnostic.SERVER_ERROR.detail":
      "The server hit an unexpected error while processing this request.",
    "diagnostic.SERVER_ERROR.likelyCause":
      "A provider request failed, configuration is incomplete, or an unhandled server path threw an error.",
    "diagnostic.SERVER_ERROR.suggestedFix":
      "Try again. If it persists, inspect Vercel function logs for this phase.",
    "diagnostic.message.rateLimitedUser":
      "Too many requests. Please slow down and try again shortly.",
    "diagnostic.message.rateLimitedShort": "Too many requests",
    "diagnostic.message.aiRequestTimedOut": "AI request timed out",
    "diagnostic.message.unexpectedServerError": "Unexpected server error",
    "diagnostic.message.failedUploadOcr": "Failed to upload image for OCR",
    "diagnostic.message.failedReachAiProvider": "Failed to reach AI provider",
    "diagnostic.message.emptyAiResponse": "Empty AI response",
    "diagnostic.message.ocrNoReadableContent": "OCR provider returned no readable content",
    "diagnostic.message.mistralQuotaExceeded": "Mistral rate limit or quota exceeded",
    "diagnostic.message.allKeysQuotaExhausted":
      "All configured Mistral API keys are rate-limited or out of quota",
    "diagnostic.message.noMistralKeys":
      "No Mistral API keys configured (set MISTRAL_API_KEY or role-specific keys)",
    "diagnostic.message.blobTokenNotConfigured": "BLOB_READ_WRITE_TOKEN is not configured",
    "diagnostic.message.aiAuthRejected": "AI provider rejected credentials ({status})",
    "diagnostic.message.aiProviderReturned": "AI provider returned {status}",
    "diagnostic.message.automaticJsonRepairFailed": "Automatic JSON repair failed",
    "diagnostic.message.jsonMalformedAfterRepair":
      "AI returned malformed JSON after automatic repair",
  },

  sk: {
    // ── Navigation ──────────────────────────────────────────────
    "nav.appAria": "Navigácia aplikácie",
    "nav.mobileAria": "Mobilná navigácia",
    "nav.homeAria": "PNGtoHTML domov",
    "nav.homeTitle": "PNGtoHTML",
    "nav.projects": "Projekty",
    "nav.new": "Snímka",
    "nav.builder": "Štúdio",
    "nav.support": "Podpora",
    "nav.settings": "Nastavenia",
    "nav.account": "Účet",
    "nav.comingSoon": "Čoskoro",

    // ── Locale switcher ─────────────────────────────────────────
    "locale.en": "EN",
    "locale.sk": "SK",
    "locale.groupAria": "Jazyk",
    "locale.switchAria": "Prepnúť jazyk na {lang}",

    // ── Theme ───────────────────────────────────────────────────
    "theme.light": "Svetlý",
    "theme.dark": "Tmavý",
    "theme.system": "Systém",
    "theme.groupAria": "Farebná téma",
    "theme.compactAria": "Téma: {label}. Kliknite pre prepnutie.",
    "theme.systemResolved": "Systém ({resolved})",

    // ── Top bar / home workspace ────────────────────────────────
    "topbar.credit":
      "Mistral OCR + Pixtral · Limity podľa IP · Skontrolujte výstup AI pred nasadením",
    "app.settings.title": "Nastavenia",
    "app.settings.description": "Predvolby generovania a Mistral API kľúče pre Snímku a Štúdio.",
    "app.settings.generationSection": "Predvolby generovania snímok",
    "app.settings.saveSuccess": "Nastavenia uložené",

    // ── Lovable editor shell ────────────────────────────────────
    "editor.promptPlaceholder": "Opýtaj sa PNGtoHTML alebo popíš zmenu…",
    "editor.build": "Build",
    "editor.console": "Konzola",
    "editor.consoleEmpty": "Zatiaľ žiadny výstup. Zapni JS v preview pre zachytenie logov.",
    "editor.fixWithAi": "Opraviť cez AI",
    "editor.model": "Model",
    "editor.modelPickerAria": "AI model pre Štúdio",
    "editor.previewEmpty": "Vygeneruj alebo nahraj pre náhľad",
    "editor.previewEmptyHint": "Vygenerované HTML sa zobrazí v tomto rámci zariadenia.",
    "editor.screenshot.emptyTitle": "Náhľad sa zobrazí tu",
    "editor.screenshot.emptyHint": "Nahrajte snímku a vygenerujte HTML pre živý náhľad.",
    "editor.projects.selectTitle": "Vyberte projekt",
    "editor.projects.selectHint": "Vyberte uložený projekt zo zoznamu pre detail výstupu.",
    "editor.templates.viewAll": "Všetky šablóny",

    "mode.groupAria": "Režim vstupu",
    "mode.upload": "Nahrať",
    "mode.url": "URL",
    "mode.text": "Text",
    "mode.import": "Import",
    "advancedSettings.summary": "Pokročilé nastavenia generovania",

    // ── Input mode panels (URL / Text / Import) ─────────────────
    "input.url.title": "Načítať obrázok z URL",
    "input.url.hint": "Vložte priamy odkaz na PNG, JPG alebo WebP screenshot.",
    "input.url.placeholder": "https://example.com/screenshot.png",
    "input.url.action": "Načítať obrázok",
    "input.url.loading": "Načítava sa…",
    "input.url.error.empty": "Zadajte URL obrázka.",
    "input.url.error.fetchFailed": "Obrázok sa z URL nepodarilo načítať.",

    "input.text.title": "Opíšte svoje UI",
    "input.text.hint": "Popis vykreslíme ako referenčný obrázok a odovzdáme generátoru.",
    "input.text.placeholder": "napr. Dashboard so bočným panelom, KPI kartami a tabuľkou…",
    "input.text.action": "Použiť popis",
    "input.text.loading": "Pripravuje sa…",
    "input.text.error.empty": "Zadajte popis UI.",
    "input.text.error.renderFailed": "Referenčný obrázok sa nepodarilo pripraviť.",

    "input.import.title": "Importovať uložené projekty",
    "input.import.hint":
      "Nahrajte JSON export z Projektov na obnovenie jedného alebo viacerých uložených generovaní.",
    "input.import.action": "Vybrať JSON súbor",
    "input.import.loading": "Importuje sa…",
    "input.import.error.invalid": "Neplatný alebo prázdny súbor projektu.",
    "input.import.error.persistFailed": "Importované projekty sa nepodarilo uložiť.",

    // ── Upload dropzone ─────────────────────────────────────────
    "upload.dropTitle": "Pretiahnite screenshot UI sem",
    "upload.dropHint": "PNG, JPG alebo WebP · max. {maxMb} MB",
    "upload.chooseFile": "Vybrať súbor",
    "upload.inputAria": "Nahrať obrázok",

    // ── Upload errors ───────────────────────────────────────────
    "upload.error.unsupportedFormat": "Nepodporovaný formát. Použite PNG, JPG alebo WebP.",
    "upload.error.emptyFile": "Súbor je prázdny.",
    "upload.error.fileTooLarge": "Súbor presahuje {maxMb} MB.",
    "upload.error.couldNotRead": "Súbor sa nepodarilo prečítať",
    "upload.error.couldNotProcess": "Obrázok sa nepodarilo spracovať",
    "upload.error.invalidImage": "Neplatný obrázok",
    "upload.error.couldNotOptimize": "Obrázok sa nepodarilo optimalizovať",
    "upload.error.couldNotPrepare": "Obrázok sa nepodarilo pripraviť na nahratie",

    // ── Image preview ───────────────────────────────────────────
    "imagePreview.altThumb": "Náhľad nahraného screenshotu UI",
    "imagePreview.altFull": "Screenshot UI v plnej veľkosti",
    "imagePreview.forensicTitle": "Otvoriť forenznú analýzu",
    "imagePreview.forensicAria": "Forenzná analýza: {fileName}",
    "imagePreview.forensicHint": "Kliknite na náhľad pre forenznú analýzu",
    "imagePreview.removeAria": "Odstrániť obrázok",

    // ── Image budget ────────────────────────────────────────────
    "imageBudget.good.label": "Vhodné pre AI",
    "imageBudget.good.detail": "Obrázok je dostatočne ľahký na spoľahlivé OCR a syntézu.",
    "imageBudget.good.recommendation": "Cieľ splnený: <=700 KB a <=1400 px na dlhšej strane.",
    "imageBudget.warning.label": "Prijateľné, no ťažšie",
    "imageBudget.warning.detail": "Obrázok by mal fungovať, syntéza však môže trvať dlhšie.",
    "imageBudget.warning.recommendation": "Ideál: <=700 KB. Horný limit: <=1.2 MB a <=1600 px.",
    "imageBudget.heavy.label": "Ťažké pre AI",
    "imageBudget.heavy.detail": "Screenshot pravdepodobne zvýši riziko timeoutu počas syntézy.",
    "imageBudget.heavy.recommendation":
      "Zmenšite/komprimujte na <=700 KB, max. <=1.2 MB pre spoľahlivé behy.",

    // ── Forensic lightbox UI ────────────────────────────────────
    "forensic.dialogTitle": "Forenzná analýza screenshotu",
    "forensic.title": "Forenzný sken",
    "forensic.closeAria": "Zavrieť forenzný pohľad",
    "forensic.leftPanel": "Vľavo · Štruktúra",
    "forensic.rightPanel": "Vpravo · Akcie",
    "forensic.scanning": "Skenovanie pixelov…",
    "forensic.zonesHeading": "Zóny UI",
    "forensic.ocrHintsHeading": "OCR tipy",
    "forensic.warningsHeading": "Upozornenia",
    "forensic.noBlockers": "Žiadne blokátory.",
    "forensic.heatmapOn": "Heatmapa zap.",
    "forensic.heatmapOff": "Heatmapa vyp.",
    "forensic.presetsHeading": "Predvoľby na 1 klik",
    "forensic.fidelity": "Vernosť",
    "forensic.fidelityAria": "Vernosť generovania",
    "forensic.fidelityPixelPerfect": "Pixel-perfect",
    "forensic.fidelityBalanced": "Vyvážená",
    "forensic.fidelitySimplified": "Zjednodušená",
    "forensic.estTokens": "Odhad tokenov:",
    "forensic.estTime": "Odhad času: ~{seconds} s",
    "forensic.target": "Cieľ: {label}",
    "forensic.regionLocked": "Pravý panel je uzamknutý na generovanie len regiónu.",
    "forensic.generateSection": "Generovať túto časť",
    "forensic.generateFull": "Generovať celú stránku",
    "forensic.selectZoneAria": "Vybrať zónu: {label}",

    // ── Forensic presets ────────────────────────────────────────
    "forensic.preset.bank.label": "Bankový výpis",
    "forensic.preset.bank.focusHint": "Optimalizované pre husté tabuľky a číselné stĺpce.",
    "forensic.preset.invoice.label": "Faktúra",
    "forensic.preset.invoice.focusHint": "Položky, sumy a hlavičkové bloky.",
    "forensic.preset.dashboard.label": "Dashboard",
    "forensic.preset.dashboard.focusHint": "Karty, bočný panel a oblasti grafov.",
    "forensic.preset.mobile.label": "Mobilná app",
    "forensic.preset.mobile.focusHint": "Mobilné rozostupy a vertikálny layout.",
    "forensic.preset.wordpress.label": "WordPress landing",
    "forensic.preset.wordpress.focusHint": "Hlavička s menu, hero, obsahové bloky, pätička s menu.",

    // ── Forensic zone labels ────────────────────────────────────
    "forensic.zone.header.label": "Hlavička / horný panel",
    "forensic.zone.header.detail": "Navigácia, logo a hlavné akcie pravdepodobne tu.",
    "forensic.zone.sidebar.label": "Bočná navigácia",
    "forensic.zone.sidebar.detail": "Vertikálne menu alebo filter na ľavom okraji.",
    "forensic.zone.content.label": "Hlavný obsah",
    "forensic.zone.content.detail": "Primárna plocha — karty, formuláre alebo text.",
    "forensic.zone.table.label": "Tabuľka / mriežka",
    "forensic.zone.table.detail": "Husté horizontálne pásy naznačujú riadky a stĺpce.",
    "forensic.zone.cards.label": "Skupina kariet",
    "forensic.zone.cards.detail": "Opakujúce sa panely s podobnou vizuálnou váhou.",
    "forensic.zone.cta.label": "CTA / akčný panel",
    "forensic.zone.cta.detail": "Tlačidlá alebo akcie na pravom okraji.",
    "forensic.zone.footer.label": "Pätička",
    "forensic.zone.footer.detail": "Vedľajšie odkazy, právny text alebo stránkovanie.",

    // ── Forensic aspect profiles ────────────────────────────────
    "forensic.aspect.ultraWide": "Ultraširoký dokument / panorama",
    "forensic.aspect.desktopLandscape": "Desktop UI na šírku",
    "forensic.aspect.mobilePortrait": "Mobilná obrazovka na výšku",
    "forensic.aspect.tallMobile": "Vysoký mobil / úzky layout",
    "forensic.aspect.balanced": "Vyvážené plátno aplikácie",

    // ── Forensic OCR hints ──────────────────────────────────────
    "forensic.ocr.canvas": "Plátno {width}×{height} — OCR beží na celom obrázku pri generovaní.",
    "forensic.ocr.zonesMapped": "{count} štruktúrnych zón namapovaných pre cielené prompty.",
    "forensic.ocr.tableDensity": "Tabuľková hustota — zachovajte zarovnanie stĺpcov v HTML.",
    "forensic.ocr.headerStrip": "Pás hlavičky — extrahujte navigačné popisy a alt text loga.",
    "forensic.ocr.sidebarNav": "Bočný panel — použite <nav> a sémantiku zoznamu.",

    // ── Forensic warnings ───────────────────────────────────────
    "forensic.warning.heavyFile.title": "Ťažké pre AI pipeline",
    "forensic.warning.heavyFile.detail": "{detail}",
    "forensic.warning.warnFile.title": "Pomalšia syntéza pravdepodobná",
    "forensic.warning.warnFile.detail": "{detail}",
    "forensic.warning.wideLayout.title": "Veľmi široký layout",
    "forensic.warning.wideLayout.detail":
      "Zvážte orezanie na hlavný stĺpec obsahu pred generovaním.",
    "forensic.warning.lowContrast.title": "Detekované svetlé UI",
    "forensic.warning.lowContrast.detail":
      "Sivý text s nízkym kontrastom môže byť ťažší pre OCR — zapnite Strict prístupnosť.",
    "forensic.warning.oversized.title": "Dlhšia strana nad 1600 px",
    "forensic.warning.oversized.detail":
      "Auto-kompresia pomôže, zmenšenie však zlepší presnosť OCR.",

    // ── Generation options ──────────────────────────────────────
    "options.output.label": "Výstup",
    "options.output.static": "Statické HTML + CSS",
    "options.output.singleFile": "Jeden HTML súbor",
    "options.output.tailwind": "Tailwind",
    "options.output.component": "Komponentový štýl",
    "options.styling.label": "Štýlovanie",
    "options.styling.vanillaCss": "Vanilla CSS",
    "options.styling.cssModules": "CSS Modules",
    "options.styling.tailwind": "Tailwind triedy",
    "options.styling.inlineCss": "Inline štýly",
    "options.responsiveness.label": "Responzivita",
    "options.responsiveness.mobileFirst": "Mobile-first",
    "options.responsiveness.desktopFirst": "Desktop-first",
    "options.responsiveness.adaptive": "Adaptívna",
    "options.accessibility.label": "Prístupnosť",
    "options.accessibility.standard": "Štandardná",
    "options.accessibility.strict": "Prísna (WCAG AA)",
    "options.extraInstructions.label": "Dodatočné inštrukcie (voliteľné)",
    "options.extraInstructions.placeholder": "Prispôsobte správanie generovania…",
    "options.defaultInstructions":
      "Reprodukujte screenshot čo najvernejšie. Zachovajte layout, rozostupy, farby, typografiu, viditeľný text, tlačidlá, karty, formuláre a navigáciu. Nevymýšľajte nesúvisiaci obsah.",

    // ── Index route ─────────────────────────────────────────────
    "index.generateHtml": "Generovať HTML",
    "index.generating": "Generujem…",
    "index.continueGeneration": "Pokračovať v generovaní",
    "index.continuing": "Pokračujem…",
    "index.generatedOutput": "Vygenerovaný výstup",
    "index.savedToProjects": "Uložené do Projektov",
    "index.saveToProjectsFailed.title": "Nepodarilo sa uložiť do Projektov",
    "index.saveToProjectsFailed.description":
      "Vygenerovaný výstup je stále k dispozícii, ale uloženie do úložiska prehliadača zlyhalo. Často to spôsobí plné lokálne úložisko — skúste odstrániť staré projekty.",
    "index.viewInProjects": "Zobraziť v Projektoch",
    "index.newUpload": "Nové nahratie",
    "index.loadedProject.hint":
      "Otvorené z Projektov · {fileName} · pokračujte v úpravách alebo nahrajte nový screenshot",
    "index.loadedProject.clear": "Zrušiť",
    "index.error.phase": "Fáza:",
    "index.error.likelyCause": "Pravdepodobná príčina:",
    "index.error.suggestedFix": "Odporúčaná oprava:",
    "index.error.tryAgain": "Skúsiť znova",

    // ── Generation phases ───────────────────────────────────────
    "phase.validating": "Validácia",
    "phase.rate_limited_check": "Limit požiadaviek",
    "phase.uploading_to_blob": "Nahratie obrázka",
    "phase.ocr": "OCR",
    "phase.synthesizing": "Syntéza",
    "phase.json_repair": "Oprava JSON",
    "phase.sanitizing": "Sanitizácia",
    "phase.done": "Hotovo",
    "phase.failed": "Zlyhalo",

    "phase.message.validating": "Validujem obrázok a nastavenia…",
    "phase.message.rate_limited_check": "Kontrolujem limity použitia…",
    "phase.message.uploading_to_blob": "Pripravujem obrázok pre OCR…",
    "phase.message.ocr": "Čítam text a štruktúru zo screenshotu…",
    "phase.message.synthesizing": "Generujem sémantické HTML a CSS…",
    "phase.message.json_repair": "Opravujem JSON výstup AI…",
    "phase.message.sanitizing": "Pripravujem bezpečný náhľad…",
    "phase.message.done": "Generovanie dokončené.",
    "phase.message.failed": "Generovanie zlyhalo.",
    "phase.message.continuing": "Pokračujem v generovaní kódu…",
    "phase.message.refining": "Aplikujem vašu úpravu…",

    // ── Loading steps ───────────────────────────────────────────
    "loading.step.validating": "Validácia vstupu",
    "loading.step.rate_limited_check": "Kontrola limitov",
    "loading.step.uploading_to_blob": "Príprava obrázka pre OCR",
    "loading.step.ocr": "Čítanie textu a štruktúry screenshotu",
    "loading.step.synthesizing": "Generovanie sémantického HTML a CSS",
    "loading.step.json_repair": "Oprava štruktúrovaného výstupu",
    "loading.step.sanitizing": "Príprava bezpečného náhľadu",
    "loading.step.done": "Hotovo",
    "loading.progressNote": "Priebeh odráža dokončené fázy pipeline, nie časovač modelu.",
    "loading.refinementProgressAria": "Priebeh úpravy",
    "loading.generationProgressAria": "Priebeh generovania",

    // ── Refinement box ──────────────────────────────────────────
    "refinement.chip.improveFidelity": "Zlepšiť vernosť",
    "refinement.chip.makeResponsive": "Urobiť responzívne",
    "refinement.chip.improveSemantics": "Zlepšiť sémantiku",
    "refinement.chip.simplifyWrappers": "Zjednodušiť obaly",
    "refinement.chip.convertTailwind": "Previesť na Tailwind",
    "refinement.chip.optimizeSeo": "Optimalizovať SEO",
    "refinement.inputAria": "Inštrukcia na úpravu",
    "refinement.placeholder": "Upravte vygenerovaný kód…",
    "refinement.button": "Upraviť",

    // ── Result tabs / code / preview ────────────────────────────
    "result.tab.preview": "Náhľad",
    "result.tab.html": "HTML",
    "result.tab.css": "CSS",
    "result.tab.js": "JS",
    "result.tab.notes": "Poznámky",
    "result.runJsInPreview": "Spustiť JS v náhľade",
    "result.downloadHtml": ".html",
    "result.notes.explanation": "Vysvetlenie",
    "result.notes.accessibility": "Prístupnosť",
    "result.notes.responsive": "Responzivita",
    "result.notes.assumptions": "Predpoklady",
    "result.notes.warnings": "Upozornenia",
    "result.previewFrameTitle": "Náhľad vygenerovaného HTML",
    "result.previewJsWarning": "JS náhľad zapnutý — kód beží v izolovanom sandboxe.",
    "result.code.copyAria": "Kopírovať kód",
    "result.code.copy": "Kopírovať",
    "result.code.copyFailed": "Kopírovanie do schránky zlyhalo",
    "result.code.copied": "Skopírované",
    "result.code.empty": "// prázdne",

    // ── Capability cards & trust strip ────────────────────────────
    "capability.aria": "Možnosti",
    "capability.screenshot.title": "Screenshot na HTML",
    "capability.screenshot.description":
      "Nahrajte screenshot UI a získajte čisté, editovateľné HTML a CSS.",
    "capability.document.title": "Dokument na HTML",
    "capability.document.description": "Rekreujte faktúry, výpisy, formuláre a A4 layouty.",
    "capability.refine.title": "Úpravy s AI",
    "capability.refine.description":
      "Zlepšite vernosť, rozostupy, sémantiku a tlačové štýly inštrukciou.",
    "capability.export.title": "Export kamkoľvek",
    "capability.export.description":
      "Stiahnite samostatné HTML, kopírujte kód alebo pokračujte vo vašom stacku.",
    "trust.aria": "Dôverujú nám",
    "trust.heading": "Dôverujú nám inžinieri a dizajnéri z",
    "trust.productTeams": "Produktové tímy",
    "trust.agencies": "Agentúry",
    "trust.indieBuilders": "Indie tvorcovia",
    "trust.designEngineers": "Design inžinieri",

    // ── Projects page ───────────────────────────────────────────
    "projects.title": "Projekty",
    "projects.subtitle": "Vaše uložené generovania screenshot→HTML v tomto prehliadači.",
    "projects.storage": "{count} projektov · {size} uložených lokálne",
    "projects.storageOne": "1 projekt · {size} uložený lokálne",
    "projects.storageMode.localStorage": "Lokálne úložisko",
    "projects.storageMode.indexedDB": "Databáza prehliadača",
    "projects.fallbackActivated.title": "Používa sa databáza prehliadača",
    "projects.fallbackActivated.description":
      "Projekty sa teraz ukladajú do databázy prehliadača, pretože lokálne úložisko je plné.",
    "projects.migrationPersistFailed.title": "Nepodarilo sa aktualizovať uložené projekty",
    "projects.migrationPersistFailed.description":
      "Projekty sa načítali do pamäte, ale zápis aktualizovaného formátu do úložiska prehliadača zlyhal. Často to spôsobí plné lokálne úložisko — skúste odstrániť staré projekty.",
    "projects.persistFailed.title": "Nepodarilo sa uložiť zmeny projektu",
    "projects.persistFailed.description":
      "Zmena nebola zapísaná do úložiska prehliadača. Často to spôsobí plné lokálne úložisko — skúste odstrániť staré projekty.",
    "projects.newProject": "Nový projekt",
    "projects.empty.title": "Zatiaľ žiadne projekty",
    "projects.empty.description":
      "Nahrajte screenshot v Nový a vygenerujte HTML — každý úspešný beh sa uloží automaticky.",
    "projects.empty.cta": "Vytvoriť prvý projekt",
    "projects.noMatch": "Žiadny projekt nezodpovedá „{query}“.",

    // ── Projects toolbar ────────────────────────────────────────
    "projects.toolbar.searchPlaceholder": "Hľadať projekty…",
    "projects.toolbar.searchAria": "Hľadať projekty",
    "projects.toolbar.sortAria": "Zoradiť projekty",
    "projects.toolbar.sort.updated": "Nedávno upravené",
    "projects.toolbar.sort.created": "Nedávno vytvorené",
    "projects.toolbar.sort.name": "Názov A–Z",

    // ── Project card ────────────────────────────────────────────
    "projectCard.lines": "{htmlLines} HTML · {cssLines} CSS",
    "projectCard.updated": "Upravené {date}",

    // ── Project detail ──────────────────────────────────────────
    "projectDetail.notFound.title": "Projekt sa nenašiel",
    "projectDetail.notFound.description":
      "Mohol byť zmazaný alebo nebol uložený v tomto prehliadači.",
    "projectDetail.backToProjects": "Späť na projekty",
    "projectDetail.allProjects": "Všetky projekty",
    "projectDetail.nameAria": "Názov projektu",
    "projectDetail.save": "Uložiť",
    "projectDetail.cancel": "Zrušiť",
    "projectDetail.renameAria": "Premenovať projekt",
    "projectDetail.meta": "{fileName} · {width}×{height} · Upravené {date}",
    "projectDetail.openInEditor": "Otvoriť v editore",
    "projectDetail.delete": "Zmazať",
    "projectDetail.deleteConfirm": "Zmazať „{name}“? Túto akciu nemožno vrátiť.",
    "projectDetail.zoomTitle": "Kliknite pre priblíženie",
    "projectDetail.zoomAria": "Priblížiť screenshot: {fileName}",
    "projectDetail.thumbAlt": "Náhľad screenshotu",
    "projectDetail.lightboxAlt": "Screenshot projektu v plnej veľkosti",
    "projectDetail.output": "Výstup:",
    "projectDetail.styling": "Štýlovanie:",
    "projectDetail.lines": "Riadky:",
    "projectDetail.linesDetail": "{htmlLines} HTML · {cssLines} CSS",
    "projectDetail.linesWithJs": "{htmlLines} HTML · {cssLines} CSS · {jsLines} JS",
    "projectDetail.created": "Vytvorené:",
    "projectDetail.generatedOutput": "Vygenerovaný výstup",

    // ── Builder workspace ───────────────────────────────────────
    "builder.brand": "VibeCraft",
    "builder.brandSubtitle": "Builder",
    "builder.newApplication": "Nová aplikácia",
    "builder.categories": "Kategórie",
    "builder.starterTemplates": "Štartovacie šablóny",
    "builder.byokReady": "BYOK pripravené",
    "builder.serverAiReady": "Serverové AI pripravené",
    "builder.demoMode": "Demo režim",
    "builder.mistralKeysSet": "Mistral kľúče nastavené",
    "builder.serverKeysConfigured": "MISTRAL_API_KEY zo server env",
    "builder.serverWithOptionalByok": "Server env aktívne — BYOK v prehliadači je voliteľné",
    "builder.templatesOnly": "Len šablóny",
    "builder.settingsAria": "Nastavenia",
    "builder.workspaceTitle": "Workspace Studio",
    "builder.mobile.aiReadyTitle": "VibeCraft AI Ready",
    "builder.mobile.aiReadyHint":
      "Vyber štartovaciu šablónu alebo popíš aplikáciu a vygeneruj interaktívny single-file layout.",
    "builder.mobile.viewAll": "Zobraziť všetko",
    "builder.mobile.newBadge": "Nové",
    "builder.mobile.activeProject": "Aktívny projekt",
    "builder.mobile.untitledProject": "Projekt bez názvu",
    "builder.mobile.live": "Live",
    "builder.mobile.deviceIphone17Air": "iPhone 17 Air (375px)",
    "builder.mobile.refreshPreview": "Obnoviť náhľad",
    "builder.mobile.runPreview": "Spustiť náhľad",
    "builder.mobile.tabFiles": "Súbory",
    "builder.mobile.tabSettings": "Nastavenia",
    "builder.mobile.tabFilesSoon": "Čoskoro",
    "builder.mobile.comingSoon": "Čoskoro",
    "builder.mobile.menuAria": "Otvoriť navigačné menu",
    "builder.mobile.navTitle": "Navigácia",
    "builder.mobile.copyCode": "Kopírovať kód",
    "builder.mobile.viewAllAria": "Zobraziť všetky štartovacie šablóny",
    "builder.mode.build": "Vytvoriť",
    "builder.mode.buildHint": "Vytvoriť novú samostatnú app",
    "builder.mode.refine": "Upraviť",
    "builder.mode.refineHint": "Zmeniť aktuálnu app",
    "builder.mode.fix": "Opraviť",
    "builder.mode.fixHint": "Opraviť aktuálnu app",
    "builder.mode.explain": "Vysvetliť",
    "builder.mode.explainHint": "Vysvetliť bez zmeny kódu",
    "builder.inputPlaceholder": "Vytvoriť, upraviť, opraviť alebo vysvetliť…",
    "builder.action.cancelGeneration": "Zrušiť generovanie",
    "builder.action.sendPrompt": "Odoslať prompt",
    "builder.inputWorking": "AI pracuje…",
    "builder.previewTab": "Živý náhľad",
    "builder.codeTab": "Kód",
    "builder.source.empty": "prázdne",
    "builder.source.demo": "demo",
    "builder.source.ai": "ai",
    "builder.source.manual": "manuálne",
    "builder.unsavedMarker": " *",
    "builder.historyAria": "Obnoviť revíziu",
    "builder.historyOption": "História ({count})",
    "builder.saveManual": "Uložiť",
    "builder.copy": "Kopírovať",
    "builder.copied": "Skopírované",
    "builder.download": "Stiahnuť",
    "builder.securityWarning": "Bezpečnostné upozornenie",
    "builder.previewJsRiskConfirm":
      "V tomto HTML boli zistené bezpečnostné výstrahy. Zapnite JS náhľad len ak dôverujete vygenerovanému kódu.",
    "builder.previewEmptyTitle": "Monitor náhľadu",
    "builder.previewEmptyHint": "Vygenerované appky sa tu zobrazia interaktívne.",
    "builder.previewFrameTitle": "VibeCraft náhľad",
    "builder.codeEditorAria": "HTML editor",
    "builder.errorPrefix": "Chyba:",

    // Builder categories
    "builder.category.portfolios": "Portfóliá a životopisy",
    "builder.category.landing": "Landing stránky",
    "builder.category.tools": "Utility nástroje",
    "builder.category.games": "Interaktívne hry",
    "builder.category.dashboards": "Dashboardy",

    // Builder template titles & descriptions (by id)
    "builder.template.snake-game.title": "Retro Snake hra",
    "builder.template.snake-game.description":
      "Plne hrateľná klasická Snake s retro canvas estetikou, skóre a mobilnými ovládačmi.",
    "builder.template.tic-tac-toe.title": "Piškvorky vs. AI",
    "builder.template.tic-tac-toe.description":
      "Piškvorky proti AI s plynulou mriežkou a animáciou výhry.",
    "builder.template.memory-game.title": "Neon Memory Match",
    "builder.template.memory-game.description":
      "Hra s párovaním kariet v cyberpunk štýle, animáciami a sériami.",
    "builder.template.pomodoro-timer.title": "Kruhový Pomodoro hub",
    "builder.template.pomodoro-timer.description":
      "Tmavý glassmorphism layout s intervalmi, SVG odpočítavaním a zvukmi.",
    "builder.template.photo-portfolio.title": "Fotograf lightbox galéria",
    "builder.template.photo-portfolio.description":
      "Minimalistická galéria s kontrastnou mriežkou, kategóriami a lightbox viewerom.",
    "builder.template.kanban-board.title": "Flow Kanban tabuľa",
    "builder.template.kanban-board.description":
      "Task tracker s presunom tlačidlami, tvorbou úloh a responzívnym layoutom.",
    "builder.template.wordpress-landing.title": "WordPress marketing landing",
    "builder.template.wordpress-landing.description":
      "WordPress štýl so sémantickou hlavičkou, hero CTA, blokmi funkcií, testimonial pásom a footer menu.",

    // Builder steps & status
    "builder.step.connect": "Pripojenie a analýza",
    "builder.step.synthesize": "Syntéza HTML",
    "builder.step.css": "Generovanie CSS",
    "builder.step.scripts": "Kompilácia skriptov",
    "builder.status.initializingBuild": "Inicializujem build…",
    "builder.status.starting": "Spúšťam {mode}…",
    "builder.status.connecting": "Pripájam…",
    "builder.status.building": "Vytváram novú app…",
    "builder.status.preparingRefine": "Pripravujem app na úpravu…",
    "builder.status.inspectingFix": "Kontrolujem app pre cielené opravy…",
    "builder.status.readingExplain": "Čítam app pre vysvetlenie…",
    "builder.status.generatingHtml": "Generujem HTML…",
    "builder.status.planningArchitecture": "Plánujem architektúru…",
    "builder.status.buildingHtml": "Staviam HTML…",
    "builder.status.reviewingRepairing": "Kontrolujem a opravujem…",
    "builder.status.buildingVariants": "Staviam kandidátne varianty…",
    "builder.status.judgingCandidates": "Vyhodnocujem kandidátov…",
    "builder.status.cancelled": "Generovanie zrušené",
    "builder.status.cancelling": "Ruším generovanie…",
    "builder.status.preparingExplanation": "Pripravujem vysvetlenie…",
    "builder.status.finalizing": "Dokončujem…",
    "builder.status.complete": "Hotovo!",
    "builder.status.done": "Dokončené",
    "builder.status.failed": "Zlyhalo",
    "builder.status.loadingTemplate": "Načítavam offline šablónu…",
    "builder.status.explanationReady": "Vysvetlenie pripravené.",

    // Builder chat messages
    "builder.background.complete": "VibeCraft generovanie dokončené",
    "builder.background.completeHint": "Workspace bol aktualizovaný, kým ste boli inde.",
    "builder.background.openBuilder": "Otvoriť Builder",
    "builder.background.failed": "VibeCraft generovanie zlyhalo",
    "builder.background.failedHint": "Otvorte Builder, skontrolujte chybu a skúste znova.",
    "builder.chat.greet":
      "VibeCraft AI pripravené. Vyberte šablónu alebo popíšte aplikáciu pre generovanie interaktívneho layoutu v jednom súbore.",
    "builder.chat.newWorkspace": "Nový workspace. Vyberte šablónu alebo popíšte layout.",
    "builder.chat.fixReply": "Oprava aplikovaná — náhľad aktualizovaný.",
    "builder.chat.refineReply": "App aktualizovaná — náhľad odráža zmenu.",
    "builder.chat.generateOnline": "Vygenerované! Pozrite Živý náhľad alebo Kód.",
    "builder.chat.generateOffline":
      "Načítané offline demo. Pridajte Mistral kľúče v Nastaveniach pre vlastné AI buildy.",
    "builder.chat.generationFailed": "Generovanie zlyhalo. Pozrite chybu nižšie.",
    "builder.chat.restored": "Obnovené: {label}.",

    // Builder version labels
    "builder.version.aiFix": "AI oprava",
    "builder.version.aiRefinement": "AI úprava",
    "builder.version.aiGeneration": "AI generovanie",
    "builder.version.demoTemplate": "Demo šablóna",
    "builder.version.manualEdit": "Manuálna úprava",

    // Builder settings dialog
    "builder.settings.title": "Mistral BYOK",
    "builder.settings.description":
      "Voliteľné kľúče v prehliadači (BYOK). Ak je MISTRAL_API_KEY v .env.local, serverové AI sa použije automaticky.",
    "builder.settings.statusByok": "BYOK kľúče sú aktívne v tomto prehliadači.",
    "builder.settings.statusServer":
      "Serverové AI je aktívne z .env.local — BYOK v tomto dialógu je voliteľné.",
    "builder.settings.statusServerWithByok":
      "Serverové AI z .env.local sa používa ako prvé. Vymažte neplatné BYOK kľúče nižšie, aby ste predišli chybám 401.",
    "builder.settings.statusDemo":
      "Nenašli sa žiadne AI kľúče. Pridajte MISTRAL_API_KEY do .env.local alebo vložte Mistral kľúč nižšie.",
    "builder.settings.saveSuccess": "Mistral kľúče uložené pre tento prehliadač.",
    "builder.settings.saveMissingKey": "Pred uložením zadajte API kľúč 1.",
    "builder.settings.key1": "API kľúč 1",
    "builder.settings.key2": "API kľúč 2 (záložný)",
    "builder.settings.key2Hint": "Použije sa, ak kľúč 1 zlyhá.",
    "builder.settings.model": "Model",
    "builder.settings.modelLarge": "Mistral Large",
    "builder.settings.modelMedium": "Mistral Medium",
    "builder.settings.modelCodestral": "Codestral",
    "builder.settings.orchestrationMode": "Režim buildera",
    "builder.settings.orchestration.fast.label": "Fast",
    "builder.settings.orchestration.fast.badge": "1 call",
    "builder.settings.orchestration.fast.description":
      "Najrýchlejší režim. Jeden AI call. Vhodné na rýchle testy a jednoduché úpravy.",
    "builder.settings.orchestration.fast.calls": "1× AI call",
    "builder.settings.orchestration.pro.label": "Pro",
    "builder.settings.orchestration.pro.badge": "Default",
    "builder.settings.orchestration.pro.description":
      "Planner → Builder → Reviewer. Najlepší default pomer kvalita / cena / čas.",
    "builder.settings.orchestration.pro.calls": "3× AI calls",
    "builder.settings.orchestration.beast.label": "Beast",
    "builder.settings.orchestration.beast.badge": "Max kvalita",
    "builder.settings.orchestration.beast.description":
      "Planner → Builder A + B → Judge → Reviewer. Vyššia kvalita, pomalšie, viac API callov.",
    "builder.settings.orchestration.beast.calls": "5× AI calls",
    "builder.settings.orchestration.beast.warning":
      "Používa viac AI callov. Vhodné na finálne vizuály, landing pages a klientské demo.",
    "builder.settings.orchestration.beastConfirmTitle": "Zapnúť Beast režim?",
    "builder.settings.orchestration.beastConfirmDescription":
      "Beast režim používa viac AI callov a môže byť pomalší. Je vhodný na finálne vizuály, landing pages a klientské demo.",
    "builder.settings.orchestration.beastConfirmAction": "Použiť Beast režim",
    "builder.settings.orchestration.beastConfirmCancel": "Zostať pri aktuálnom režime",
    "builder.trace.title": "Priebeh generovania",
    "builder.trace.total": "Celkom",
    "builder.trace.mode": "Režim",
    "builder.trace.status.pending": "Čaká",
    "builder.trace.status.running": "Prebieha",
    "builder.trace.status.success": "Úspech",
    "builder.trace.status.failed": "Zlyhalo",
    "builder.trace.status.cancelled": "Zrušené",
    "builder.trace.status.skipped": "Preskočené",
    "builder.trace.step.planning": "Plánovanie",
    "builder.trace.step.building": "Generovanie",
    "builder.trace.step.buildingA": "Generovanie A",
    "builder.trace.step.buildingB": "Generovanie B",
    "builder.trace.step.judging": "Hodnotenie",
    "builder.trace.step.reviewing": "Kontrola",
    "builder.trace.step.finalizing": "Finalizácia",
    "builder.trace.retrying": "Opakujem",
    "builder.trace.retriedOnce": "opakované raz",
    "builder.trace.retryCount": "Opakovania: {count}",
    "builder.trace.lastError": "Posledná chyba",
    "builder.trace.timedOut": "Čas vypršal",
    "builder.trace.timeoutAfter": "Čas vypršal po {duration}",
    "builder.trace.fallbackUsed": "Použitý fallback",
    "builder.trace.waitingToRetry": "Čakám na opakovanie",
    "builder.trace.retryDelay": "Oneskorenie retry",
    "builder.metrics.aiCalls": "AI volania",
    "builder.metrics.retries": "Opakovania",
    "builder.metrics.timeouts": "Timeouty",
    "builder.metrics.fallbacks": "Fallbacky",
    "builder.profile.title": "Kvalitný profil",
    "builder.profile.auto.label": "Auto",
    "builder.profile.auto.description":
      "Automaticky vyberie najlepší štýlový profil podľa kľúčových slov v prompte.",
    "builder.profile.premiumSaas.label": "Premium SaaS",
    "builder.profile.premiumSaas.description":
      "Moderný premium SaaS vzhľad s prepracovanými kartami, hierarchiou a profesionálnym UI.",
    "builder.profile.neonParallax.label": "Neon Parallax",
    "builder.profile.neonParallax.description":
      "Vhodné pre futuristický neon, 3D hĺbku, parallax a cinematik showcase.",
    "builder.profile.appleGlass.label": "Apple Glass",
    "builder.profile.appleGlass.description":
      "Apple-like glass povrchy, liquid gradienty, jemné tiene a precízne spacing.",
    "builder.profile.dashboardPro.label": "Dashboard Pro",
    "builder.profile.dashboardPro.description":
      "Seriózny dashboard s dátovými kartami, tabuľkami, filtrami a responzívnym admin shellom.",
    "builder.profile.pwaMobile.label": "PWA Mobile",
    "builder.profile.pwaMobile.description":
      "Mobile-first app shell so safe-area podporou a touch-friendly ovládaním.",
    "builder.profile.wordpressLanding.label": "WordPress Landing",
    "builder.profile.wordpressLanding.description":
      "WordPress/plugin business landing so sekciami benefitov, dôkazmi a CTA.",
    "builder.profile.luxuryBrand.label": "Luxury Brand",
    "builder.profile.luxuryBrand.description":
      "Prémiová luxury identita s editorial spacingom a cinematik hero sekciou.",
    "builder.profile.minimalClean.label": "Minimal Clean",
    "builder.profile.minimalClean.description":
      "Čisté minimal UI s presným spacingom a minimom vizuálneho šumu.",
    "builder.profile.recommendedMode": "Odporúčané",
    "builder.profile.fastWarning": "Tento profil funguje najlepšie s Pro alebo Beast.",
    "builder.health.title": "HTML Health",
    "builder.health.profile": "Profil",
    "builder.health.minimumExpectedScore": "Minimálne očakávané skóre",
    "builder.health.score": "Skóre",
    "builder.health.critical": "Kritické",
    "builder.health.warning": "Varovania",
    "builder.health.info": "Info",
    "builder.health.noIssues": "Nenašli sa žiadne problémy.",
    "builder.health.showDetails": "Zobraziť nálezy",
    "builder.health.hideDetails": "Skryť nálezy",
    "builder.health.applyPolishFix": "Opraviť motion, focus a responzivitu",
    "builder.health.applyPolishFixHint":
      "Načíta Fix prompt pre reduced-motion, focus-visible a responzívne breakpointy",
    "builder.health.category.structure": "Štruktúra",
    "builder.health.category.security": "Bezpečnosť",
    "builder.health.category.accessibility": "Prístupnosť",
    "builder.health.category.responsive": "Responzivita",
    "builder.health.category.motion": "Animácie",
    "builder.health.category.visual": "Vizuál",
    "builder.health.category.javascript": "JavaScript",
    "builder.health.category.parallax": "Parallax / 3D",
    "builder.health.category.performance": "Výkon",
    "builder.health.chip.viewport": "Viewport",
    "builder.health.chip.reducedMotion": "Reduced motion",
    "builder.health.chip.mediaQueries": "Media queries",
    "builder.health.chip.cssVariables": "CSS premenné",
    "builder.health.chip.externalScripts": "Vzdialené skripty",
    "builder.health.finding.missingDoctype.title": "Chýba DOCTYPE",
    "builder.health.finding.missingDoctype.message":
      "HTML by malo začínať <!DOCTYPE html> pre predvídateľné renderovanie.",
    "builder.health.finding.missingHtml.title": "Chýba <html>",
    "builder.health.finding.missingHtml.message": "Dokument nemá koreňový element <html>.",
    "builder.health.finding.missingHead.title": "Chýba <head>",
    "builder.health.finding.missingHead.message": "Dokument nemá sekciu <head>.",
    "builder.health.finding.missingBody.title": "Chýba <body>",
    "builder.health.finding.missingBody.message": "Dokument nemá sekciu <body>.",
    "builder.health.finding.missingTitle.title": "Chýba <title>",
    "builder.health.finding.missingTitle.message": "Stránka nemá element <title>.",
    "builder.health.finding.markdownFences.title": "Markdown fence",
    "builder.health.finding.markdownFences.message":
      "Výstup stále obsahuje markdown code fence namiesto čistého HTML.",
    "builder.health.finding.externalScript.title": "Externý skript",
    "builder.health.finding.externalScript.message":
      "Našiel sa vzdialený <script src>. Preferuj inline alebo dôveryhodné lokálne skripty.",
    "builder.health.finding.inlineRemoteImport.title": "Vzdialený import",
    "builder.health.finding.inlineRemoteImport.message": "JavaScript importuje vzdialený modul.",
    "builder.health.finding.evalUsage.title": "Použitie eval()",
    "builder.health.finding.evalUsage.message": "eval() je rizikový dynamický vzor.",
    "builder.health.finding.newFunctionUsage.title": "Použitie new Function()",
    "builder.health.finding.newFunctionUsage.message":
      "Dynamické vytváranie Function je v generovaných appkách rizikové.",
    "builder.health.finding.documentWrite.title": "Použitie document.write()",
    "builder.health.finding.documentWrite.message":
      "document.write() môže rozbiť renderovanie a nie je vhodné v moderných appkách.",
    "builder.health.finding.suspiciousInnerHtml.title": "Priradenie innerHTML",
    "builder.health.finding.suspiciousInnerHtml.message":
      "Detegované priradenie innerHTML. Over sanitizáciu obsahu.",
    "builder.health.finding.javascriptUrl.title": "javascript: URL",
    "builder.health.finding.javascriptUrl.message": "V dokumente sa našla javascript: URL.",
    "builder.health.finding.remoteTrackingPixel.title": "Vzdialený tracking pixel",
    "builder.health.finding.remoteTrackingPixel.message":
      "Vzdialený 1×1 obrázok naznačuje tracking pixel.",
    "builder.health.finding.remoteIframe.title": "Vzdialený iframe",
    "builder.health.finding.remoteIframe.message": "Detegovaný vzdialený iframe embed.",
    "builder.health.finding.selectorNoMatch.title": "Selektor nemusí sedieť",
    "builder.health.finding.selectorNoMatch.message":
      "Cieľ querySelector/getElementById sa v statickom HTML nenašiel.",
    "builder.health.finding.unguardedEventListener.title": "Event listener bez guardu",
    "builder.health.finding.unguardedEventListener.message":
      "Event listener je pripojený bez null kontroly.",
    "builder.health.finding.missingViewport.title": "Chýba viewport meta",
    "builder.health.finding.missingViewport.message":
      "Chýba viewport meta tag pre responzívne škálovanie.",
    "builder.health.finding.noMediaQueriesMultiSection.title": "Chýbajú media queries",
    "builder.health.finding.noMediaQueriesMultiSection.message":
      "Viac-sekčný layout nemá @media pravidlá pre menšie obrazovky.",
    "builder.health.finding.fixedLargeWidths.title": "Fixné veľké šírky",
    "builder.health.finding.fixedLargeWidths.message":
      "Viac fixných šírok nad 900px môže rozbiť mobilný layout.",
    "builder.health.finding.mobileHostileWidth.title": "Mobilne nepriateľská šírka",
    "builder.health.finding.mobileHostileWidth.message":
      "Hlavný kontajner používa fixnú šírku 1200px.",
    "builder.health.finding.animationWithoutReducedMotion.title": "Animácie bez reduced-motion",
    "builder.health.finding.animationWithoutReducedMotion.message":
      "Animácie existujú, ale chýba prefers-reduced-motion fallback.",
    "builder.health.finding.tooManyInfiniteAnimations.title": "Veľa infinite animácií",
    "builder.health.finding.tooManyInfiniteAnimations.message":
      "Viac infinite animácií môže škodiť výkonu a prístupnosti.",
    "builder.health.finding.emptyButton.title": "Prázdne tlačidlo",
    "builder.health.finding.emptyButton.message": "Tlačidlo nemá viditeľný text ani aria-label.",
    "builder.health.finding.interactiveNoLabel.title": "Prvok bez mena",
    "builder.health.finding.interactiveNoLabel.message":
      "Interaktívny prvok nemá viditeľný text ani prístupné meno.",
    "builder.health.finding.iconOnlyNoAria.title": "Ikonové tlačidlo",
    "builder.health.finding.iconOnlyNoAria.message":
      "Tlačidlo alebo odkaz len s ikonou potrebuje aria-label.",
    "builder.health.finding.imageMissingAlt.title": "Obrázok bez alt",
    "builder.health.finding.imageMissingAlt.message": "Aspoň jeden obrázok nemá alt text.",
    "builder.health.finding.noFocusStyles.title": "Chýbajú focus štýly",
    "builder.health.finding.noFocusStyles.message":
      "Interaktívne UI existuje, ale nenašli sa focus/focus-visible štýly.",
    "builder.health.finding.promptNeonMissing.title": "Chýba neon vizuál",
    "builder.health.finding.promptNeonMissing.message":
      "Prompt žiadal neon, ale výstup nemá neon/glow markery.",
    "builder.health.finding.promptGlassMissing.title": "Chýba glass vizuál",
    "builder.health.finding.promptGlassMissing.message":
      "Prompt žiadal glass, ale chýbajú backdrop-filter/glass markery.",
    "builder.health.finding.promptParallaxMissing.title": "Chýba parallax/3D vizuál",
    "builder.health.finding.promptParallaxMissing.message":
      "Prompt žiadal parallax alebo 3D, ale chýba perspektíva/hĺbka.",
    "builder.health.finding.promptPremiumMissing.title": "Chýba premium vizuál",
    "builder.health.finding.promptPremiumMissing.message":
      "Prompt žiadal premium/wow vizuál, ale polish markery sú slabé.",
    "builder.health.finding.parallaxTopLeftNoPosition.title": "Offset bez position",
    "builder.health.finding.parallaxTopLeftNoPosition.message":
      "top/left offsety sú bez position:absolute/relative/fixed/sticky.",
    "builder.health.finding.transformStyleNoPerspective.title": "preserve-3d bez perspective",
    "builder.health.finding.transformStyleNoPerspective.message":
      "transform-style: preserve-3d je bez perspective kontextu.",
    "builder.health.finding.pointerParallaxNoReducedMotion.title": "Pointer parallax bez fallbacku",
    "builder.health.finding.pointerParallaxNoReducedMotion.message":
      "Mouse parallax nemá prefers-reduced-motion podporu.",
    "builder.health.finding.parallaxMissingPerspective.title": "Chýba parallax hĺbka",
    "builder.health.finding.parallaxMissingPerspective.message":
      "Parallax/3D zámer je, ale chýba perspective alebo preserve-3d.",
    "builder.health.finding.excessiveParticles.title": "Veľa častíc",
    "builder.health.finding.excessiveParticles.message":
      "Veľký počet particles/dots môže škodiť výkonu.",
    "builder.health.finding.excessiveBoxShadow.title": "Veľa box-shadow",
    "builder.health.finding.excessiveBoxShadow.message":
      "Príliš veľa glow/shadow vrstiev zvyšuje paint náklady.",
    "builder.health.finding.willChangeOveruse.title": "Nadmerné will-change",
    "builder.health.finding.willChangeOveruse.message":
      "Príliš veľa will-change môže plytvať GPU pamäťou.",
    "builder.health.finding.profile.minimumScoreNotMet.title": "Pod minimom profilu",
    "builder.health.finding.profile.minimumScoreNotMet.message":
      "HTML health skóre je pod minimálnym očakávaním zvoleného profilu.",
    "builder.health.finding.profile.reducedMotionExpected.title": "Očakáva sa reduced motion",
    "builder.health.finding.profile.reducedMotionExpected.message":
      "Tento profil očakáva prefers-reduced-motion podporu pri animáciách.",
    "builder.health.finding.profile.mediaQueriesExpected.title": "Očakávajú sa media queries",
    "builder.health.finding.profile.mediaQueriesExpected.message":
      "Tento profil očakáva responzívne @media pravidlá pre menšie obrazovky.",
    "builder.health.finding.profile.cssVariablesExpected.title": "Očakávajú sa CSS premenné",
    "builder.health.finding.profile.cssVariablesExpected.message":
      "Tento profil očakáva CSS custom properties pre theming a polish.",
    "builder.health.finding.profile.externalScriptsNotAllowed.title":
      "Externé skripty nie sú povolené",
    "builder.health.finding.profile.externalScriptsNotAllowed.message":
      "Tento profil nepovoľuje vzdialené script zdroje vo výstupe.",
    "builder.error.timeout": "Krok prekročil časový limit.",
    "builder.error.step.connecting": "Pripojenie zlyhalo",
    "builder.error.step.planning": "Planner zlyhal",
    "builder.error.step.building": "Builder zlyhal",
    "builder.error.step.reviewing": "Reviewer zlyhal",
    "builder.error.step.judging": "Judge zlyhal",
    "builder.error.step.explaining": "Vysvetlenie zlyhalo",
    "builder.error.step.finalizing": "Finalizácia zlyhala",
    "builder.error.cancelled": "Generovanie zrušené.",
    "builder.settings.showKeys": "Zobraziť",
    "builder.settings.hideKeys": "Skryť",
    "builder.settings.keysSuffix": "kľúče",
    "builder.settings.cancel": "Zrušiť",
    "builder.settings.save": "Uložiť",

    // Builder risk scanner
    "builder.risk.externalScript": "Externý skript",
    "builder.risk.inlineHandlers": "Inline event handlery",
    "builder.risk.nestedIframe": "Vnorený iframe",
    "builder.risk.possibleSecret": "Možný secret",
    "builder.risk.inlineHandlersDetail": "Nájdených {count} handler atribútov",
    "builder.risk.nestedIframeDetail": "Vygenerované HTML obsahuje iframe",
    "builder.risk.possibleSecretDetail": "Kód obsahuje reťazec podobný API kľúču alebo tokenu",

    // ── Root 404 / error pages ──────────────────────────────────
    "error404.title": "404",
    "error404.heading": "Stránka sa nenašla",
    "error404.description": "Stránka, ktorú hľadáte, neexistuje alebo bola presunutá.",
    "error404.goHome": "Domov",
    "errorPage.heading": "Stránka sa nenačítala",
    "errorPage.description":
      "Niečo sa pokazilo na našej strane. Skúste obnoviť stránku alebo prejdite domov.",
    "errorPage.tryAgain": "Skúsiť znova",
    "errorPage.goHome": "Domov",

    // ── Document meta (title / SEO) ─────────────────────────────
    "meta.root.title": "PNGtoHTMLapp — Screenshot na čisté HTML",
    "meta.root.description":
      "Nahrajte UI screenshot a získajte čisté sémantické HTML a CSS generované AI. Sandbox náhľad, kopírovanie a sťahovanie.",
    "meta.root.ogTitle": "PNGtoHTMLapp",
    "meta.root.ogDescription": "Premeňte UI screenshoty na čisté sémantické HTML s AI.",
    "meta.index.title": "PNGtoHTMLapp — Screenshot na čisté HTML",
    "meta.index.description":
      "Nahrajte UI screenshot a získajte čisté sémantické HTML a CSS generované AI. Sandbox náhľad, kopírovanie a sťahovanie.",
    "meta.index.ogTitle": "PNGtoHTMLapp",
    "meta.index.ogDescription": "Premeňte UI screenshoty na čisté sémantické HTML s AI.",
    "meta.projects.title": "Projekty — PNGtoHTMLapp",
    "meta.projects.description": "Prehliadajte a spravujte projekty generovania screenshot → HTML.",
    "meta.projects.ogTitle": "Projekty — PNGtoHTMLapp",
    "meta.projects.ogDescription":
      "Prehliadajte a spravujte projekty generovania screenshot → HTML.",
    "meta.builder.title": "VibeCraft Builder — PNGtoHTMLapp",
    "meta.builder.description":
      "Prompt-to-HTML builder s offline šablónami, AI generovaním, sandbox náhľadom a históriou verzií.",
    "meta.builder.ogTitle": "VibeCraft Builder — PNGtoHTMLapp",
    "meta.builder.ogDescription":
      "Prompt-to-HTML builder s offline šablónami, AI generovaním, sandbox náhľadom a históriou verzií.",

    // ── Diagnostic errors (ApiErrorCode) ────────────────────────
    "diagnostic.INVALID_FILE.title": "Neplatný vstup obrázka",
    "diagnostic.INVALID_FILE.detail":
      "Nahraný obrázok chýba alebo sa nepodarilo prečítať jeho obsah.",
    "diagnostic.INVALID_FILE.likelyCause":
      "Prehliadač odoslal prázdny, poškodený alebo nepodporovaný súbor.",
    "diagnostic.INVALID_FILE.suggestedFix":
      "Nahrajte nový PNG, JPG alebo WebP screenshot a skúste znova.",
    "diagnostic.FILE_TOO_LARGE.title": "Obrázok je príliš veľký",
    "diagnostic.FILE_TOO_LARGE.detail": "Obrázok presahuje nastavený limit pre nahratie.",
    "diagnostic.FILE_TOO_LARGE.likelyCause":
      "Screenshot je väčší, než dokáže aplikácia bezpečne odoslať do AI pipeline.",
    "diagnostic.FILE_TOO_LARGE.suggestedFix":
      "Zmenšite alebo skomprimujte screenshot a generujte znova.",
    "diagnostic.UNSUPPORTED_FORMAT.title": "Nepodporovaný formát obrázka",
    "diagnostic.UNSUPPORTED_FORMAT.detail": "Akceptované sú len PNG, JPG a WebP screenshoty.",
    "diagnostic.UNSUPPORTED_FORMAT.likelyCause":
      "Vybraný súbor nie je jedným z podporovaných typov obrázkov.",
    "diagnostic.UNSUPPORTED_FORMAT.suggestedFix": "Exportujte screenshot ako PNG, JPG alebo WebP.",
    "diagnostic.RATE_LIMITED.title": "Dosiahnutý limit požiadaviek",
    "diagnostic.RATE_LIMITED.detail":
      "Táto IP adresa odoslala príliš veľa požiadaviek na generovanie v krátkom čase.",
    "diagnostic.RATE_LIMITED.likelyCause": "Bol prekročený burst alebo denný limit Upstash Redis.",
    "diagnostic.RATE_LIMITED.suggestedFix":
      "Počkajte pred opakovaním. Pri vlastnom nasadení zvážte zvýšenie RATE_LIMIT_BURST alebo RATE_LIMIT_DAILY.",
    "diagnostic.MISSING_API_KEY.title": "Chýba Mistral API kľúč",
    "diagnostic.MISSING_API_KEY.detail":
      "Server nemôže volať Mistral, pretože MISTRAL_API_KEY nie je nakonfigurovaný.",
    "diagnostic.MISSING_API_KEY.likelyCause":
      "V produkčnom alebo preview prostredí chýba MISTRAL_API_KEY.",
    "diagnostic.MISSING_API_KEY.suggestedFix":
      "Pridajte MISTRAL_API_KEY do Vercel Environment Variables a redeployujte.",
    "diagnostic.AI_AUTH_ERROR.title": "Mistral autentifikácia zlyhala",
    "diagnostic.AI_AUTH_ERROR.detail":
      "Mistral odmietol API požiadavku kvôli chybe autentifikácie alebo oprávnení.",
    "diagnostic.AI_AUTH_ERROR.likelyCause":
      "MISTRAL_API_KEY je neplatný, expirovaný, nemá oprávnenia alebo patrí inému účtu.",
    "diagnostic.AI_AUTH_ERROR.suggestedFix":
      "Obnovte Mistral kľúč, aktualizujte ho vo Vercel a redeployujte pred opakovaním.",
    "diagnostic.AI_QUOTA_EXHAUSTED.title": "Mistral kvóta vyčerpaná",
    "diagnostic.AI_QUOTA_EXHAUSTED.detail":
      "Všetky nakonfigurované Mistral API kľúče sú rate-limitované alebo bez kvóty.",
    "diagnostic.AI_QUOTA_EXHAUSTED.likelyCause":
      "Aktívny Mistral kľúč nemá zostávajúcu kvótu a pre toto prostredie nie je dostupný záložný kľúč.",
    "diagnostic.AI_QUOTA_EXHAUSTED.suggestedFix":
      "Pridajte MISTRAL_API_KEY_FALLBACK alebo MISTRAL_API_KEYS vo Vercel, prípadne nastavte MISTRAL_OCR_API_KEY a MISTRAL_CHAT_API_KEY na rozdelenie OCR a syntézy. Po zmene env redeployujte.",
    "diagnostic.MISSING_BLOB_TOKEN.title": "Chýba Blob storage token",
    "diagnostic.MISSING_BLOB_TOKEN.detail":
      "Server nemôže nahrať screenshot, pretože BLOB_READ_WRITE_TOKEN nie je nakonfigurovaný.",
    "diagnostic.MISSING_BLOB_TOKEN.likelyCause": "V tomto prostredí chýba premenná Vercel Blob.",
    "diagnostic.MISSING_BLOB_TOKEN.suggestedFix":
      "Pridajte BLOB_READ_WRITE_TOKEN do Vercel Environment Variables a redeployujte.",
    "diagnostic.BLOB_UPLOAD_FAILED.title": "Nahratie obrázka zlyhalo",
    "diagnostic.BLOB_UPLOAD_FAILED.detail": "Screenshot sa nepodarilo nahrať na spracovanie OCR.",
    "diagnostic.BLOB_UPLOAD_FAILED.likelyCause":
      "Vercel Blob odmietol nahratie, token je neplatný alebo sieťová požiadavka zlyhala.",
    "diagnostic.BLOB_UPLOAD_FAILED.suggestedFix":
      "Skontrolujte BLOB_READ_WRITE_TOKEN a stav Vercel Blob, potom skúste znova.",
    "diagnostic.AI_TIMEOUT.title": "Timeout AI generovania",
    "diagnostic.AI_TIMEOUT.titleOcr": "Timeout OCR",
    "diagnostic.AI_TIMEOUT.detail":
      "AI poskytovateľ neodpovedal pred vypršaním serverového timeoutu.",
    "diagnostic.AI_TIMEOUT.likelyCause":
      "Screenshot môže byť príliš veľký alebo vizuálne zložitý, Mistral môže byť pomalý alebo sieť je nestabilná.",
    "diagnostic.AI_TIMEOUT.suggestedFix":
      "Screenshot <=700 KB je najspoľahlivejší; <=1.2 MB je zvyčajne OK. Dlhšia strana <=1600 px, orežte nepotrebný obsah.",
    "diagnostic.AI_INVALID_RESPONSE.title": "Neplatný výstup AI",
    "diagnostic.AI_INVALID_RESPONSE.titleOcr": "Nečitateľná OCR odpoveď",
    "diagnostic.AI_INVALID_RESPONSE.detail":
      "AI poskytovateľ vrátil prázdnu alebo poškodenú odpoveď.",
    "diagnostic.AI_INVALID_RESPONSE.likelyCause":
      "Screenshot môže byť nejednoznačný alebo model vrátil text, ktorý nezodpovedá očakávanej schéme.",
    "diagnostic.AI_INVALID_RESPONSE.suggestedFix":
      "Skúste znova s jasnejšími inštrukciami alebo čistejším screenshotom.",
    "diagnostic.JSON_REPAIR_FAILED.title": "Oprava JSON zlyhala",
    "diagnostic.JSON_REPAIR_FAILED.detail":
      "Výstup modelu sa nepodarilo opraviť do požadovanej JSON schémy.",
    "diagnostic.JSON_REPAIR_FAILED.likelyCause":
      "Syntéza modelu pravdepodobne vrátila príliš dlhú odpoveď, ktorá bola skrátená v JSON reťazci. Aplikácia už skúsila automatické obnovenie a opravu, ale odpoveď stále nebola použiteľná.",
    "diagnostic.JSON_REPAIR_FAILED.suggestedFix":
      "Skúste raz s predvolenou predvoľbou. Ak sa opakuje, odstráňte extra inštrukcie, orežte veľký screenshot a použite Pokračovať po čiastočnom výsledku.",
    "diagnostic.SANITIZE_FAILED.title": "Sanitizácia náhľadu zlyhala",
    "diagnostic.SANITIZE_FAILED.detail":
      "Vygenerované HTML sa nepodarilo bezpečne pripraviť na náhľad.",
    "diagnostic.SANITIZE_FAILED.likelyCause":
      "Vygenerovaný markup obsahuje neplatné alebo nebezpečné konštrukcie.",
    "diagnostic.SANITIZE_FAILED.suggestedFix":
      "Skúste generovať znova alebo vypnite riskantné vlastné inštrukcie.",
    "diagnostic.SERVER_ERROR.title": "Neočakávaná chyba servera",
    "diagnostic.SERVER_ERROR.detail":
      "Server zaznamenal neočakávanú chybu pri spracovaní tejto požiadavky.",
    "diagnostic.SERVER_ERROR.likelyCause":
      "Zlyhala požiadavka na poskytovateľa, konfigurácia je neúplná alebo nenahradená serverová cesta vyhodila chybu.",
    "diagnostic.SERVER_ERROR.suggestedFix":
      "Skúste znova. Ak pretrváva, skontrolujte Vercel function logy pre túto fázu.",
    "diagnostic.message.rateLimitedUser":
      "Príliš veľa požiadaviek. Spomaľte a skúste to o chvíľu znova.",
    "diagnostic.message.rateLimitedShort": "Príliš veľa požiadaviek",
    "diagnostic.message.aiRequestTimedOut": "Timeout AI požiadavky",
    "diagnostic.message.unexpectedServerError": "Neočakávaná chyba servera",
    "diagnostic.message.failedUploadOcr": "Nahratie obrázka pre OCR zlyhalo",
    "diagnostic.message.failedReachAiProvider": "Nepodarilo sa kontaktovať AI poskytovateľa",
    "diagnostic.message.emptyAiResponse": "Prázdna odpoveď AI",
    "diagnostic.message.ocrNoReadableContent": "OCR poskytovateľ nevrátil čitateľný obsah",
    "diagnostic.message.mistralQuotaExceeded": "Mistral rate limit alebo kvóta prekročená",
    "diagnostic.message.allKeysQuotaExhausted":
      "Všetky nakonfigurované Mistral API kľúče sú rate-limitované alebo bez kvóty",
    "diagnostic.message.noMistralKeys":
      "Nie sú nakonfigurované žiadne Mistral API kľúče (nastavte MISTRAL_API_KEY alebo role-specific kľúče)",
    "diagnostic.message.blobTokenNotConfigured": "BLOB_READ_WRITE_TOKEN nie je nakonfigurovaný",
    "diagnostic.message.aiAuthRejected": "AI poskytovateľ odmietol prihlasovacie údaje ({status})",
    "diagnostic.message.aiProviderReturned": "AI poskytovateľ vrátil {status}",
    "diagnostic.message.automaticJsonRepairFailed": "Automatická oprava JSON zlyhala",
    "diagnostic.message.jsonMalformedAfterRepair":
      "AI vrátilo poškodený JSON aj po automatickej oprave",
  },
} as const;

export type MessageKey = keyof typeof messages.en;
