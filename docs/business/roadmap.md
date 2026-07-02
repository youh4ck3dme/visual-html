# Business and product roadmap

This roadmap connects product quality, monetization and go-to-market execution.

## Now: quality foundation

Goal: make the core conversion reliable enough that users trust the first output.

Priorities:

- improve visual fidelity for UI screenshots,
- improve A4/print fidelity for documents and tables,
- ensure generated HTML includes complete CSS,
- keep standalone HTML export working,
- keep OCR uncertainty visible,
- reduce malformed JSON and timeout failures,
- maintain provider failover,
- keep QA dashboard updated,
- add repeatable smoke tests.

Success criteria:

- most normal screenshots generate a usable preview,
- document/table screenshots use A4 portrait or landscape when appropriate,
- exports open correctly as standalone HTML,
- errors explain what happened and how to retry.

## Phase 1: billing readiness

Goal: prepare for first paid users.

Features:

- authentication,
- user accounts,
- project history,
- saved generated outputs,
- credit ledger,
- plan limits,
- Stripe checkout,
- Stripe customer portal,
- basic admin usage view,
- upgrade prompts.

Business output:

- Free and Pro pricing,
- privacy policy,
- terms of service,
- public pricing page,
- cost benchmark per 100 generations.

## Phase 2: Pro launch

Goal: validate willingness to pay.

Features:

- Pro plan,
- more credits,
- higher-quality presets,
- saved projects,
- export presets,
- QA dashboard access,
- BYOK option.

GTM:

- before/after demo gallery,
- Product Hunt or Show HN launch,
- developer community demos,
- SEO pages for screenshot-to-HTML and PNG-to-HTML.

Metrics:

- free-to-paid conversion,
- preview-to-export rate,
- credit usage per paid user,
- gross margin,
- churn/refunds.

## Phase 3: Team and agency

Goal: increase ARPU and retention.

Features:

- team workspaces,
- multiple seats,
- shared projects,
- team prompt presets,
- brand/client presets,
- shared billing,
- higher credit pools,
- priority generation,
- batch conversion.

Business output:

- Team plan,
- Agency plan,
- annual discounts,
- agency beta outreach,
- client-ready exports.

## Phase 4: API and integrations

Goal: serve high-volume and workflow integrations.

Features:

- API keys,
- REST endpoint for image-to-HTML,
- webhook or async jobs,
- usage dashboard,
- rate limits,
- docs and examples,
- SDK later if demand exists.

Potential integrations:

- VS Code extension,
- Figma helper workflow,
- CMS plugins,
- internal enterprise tools,
- document automation pipelines.

Business output:

- API pricing,
- minimum monthly commit,
- integration waitlist,
- enterprise lead capture.

## Phase 5: Enterprise/private deployment

Goal: support privacy-sensitive and high-value customers.

Features:

- SSO,
- audit logs,
- private deployment,
- custom retention,
- provider key management,
- custom model/provider options,
- DPA and security docs,
- SLA.

Business output:

- enterprise sales deck,
- security questionnaire answers,
- deployment guide,
- custom contracts.

## Roadmap by time horizon

### 0-30 days

- stabilize current generation quality,
- create anonymized demos,
- finish business docs,
- validate pricing with users,
- measure provider cost,
- improve A4/table fidelity.

### 31-60 days

- add accounts and history,
- add credit accounting,
- integrate Stripe test mode,
- prepare pricing page,
- publish demo gallery,
- start SEO content.

### 61-90 days

- launch Pro plan,
- run public launch,
- add Team waitlist,
- contact agencies,
- improve QA dashboard,
- collect testimonials.

### 3-6 months

- Team/Agency plans,
- batch conversion,
- visual diff scoring,
- API beta,
- better provider routing,
- advanced document presets.

### 6-12 months

- enterprise/private deployment,
- plugin ecosystem,
- template marketplace exploration,
- multi-provider model selection,
- larger API customers.

## Dependencies

Product quality comes before aggressive monetization. Users will only pay if:

- upload works reliably,
- preview is useful,
- export is clean,
- failure states are understandable,
- generated output saves real time.

Billing should follow evidence of repeat usage, not precede it too early.
