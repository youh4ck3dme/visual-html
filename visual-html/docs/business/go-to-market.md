# Go-to-market plan

This plan focuses on validating demand, proving visual quality, and turning repeat usage into paid subscriptions.

## GTM principle

Do not launch as a generic AI builder. Launch with specific proof:

- real screenshot in,
- clean HTML out,
- preview visible,
- refinement possible,
- export available,
- A4/document/table examples better than generic tools.

## Phase 1: founder-led validation

Goal: prove that users care enough to use and pay.

Timeline: 2-4 weeks.

Actions:

1. Create 10-20 anonymized before/after examples.
2. Include several categories: landing section, dashboard, auth screen, pricing page, invoice, table, A4 statement.
3. Record short videos showing upload -> generate -> preview -> refine -> export.
4. Talk to frontend developers, freelancers and agencies.
5. Ask for real screenshots they are allowed to test.
6. Measure manual time saved.
7. Collect failure cases and improve prompts/presets.

Validation questions:

- Would you use this weekly?
- What would you replace with this?
- How much time did it save?
- What output quality is good enough?
- Would you pay 29 EUR/month for this?
- Would your team pay 99 EUR/month?

## Phase 2: public launch

Goal: create awareness and first signups.

Channels:

- Product Hunt,
- Hacker News Show HN,
- Reddit webdev/frontend communities,
- X/Twitter demos,
- LinkedIn posts,
- Indie Hackers,
- relevant Discord/Slack developer groups.

Launch assets:

- short demo video,
- before/after gallery,
- clear pricing,
- privacy/BYOK explanation,
- examples with dense UI and A4 documents,
- changelog showing active improvement.

Launch message:

"I built an AI tool that turns screenshots into editable HTML/CSS with live preview and refinement. It is optimized for practical frontend rebuilds and document/table layouts, not just landing-page demos."

## Phase 3: SEO and content

Goal: create durable acquisition.

Content topics:

- How to convert a screenshot to HTML.
- PNG to HTML: practical workflow.
- AI screenshot-to-code tools compared.
- How to recreate an invoice as HTML.
- How to convert a bank statement screenshot into printable HTML.
- Figma vs screenshot-to-HTML workflow.
- Best practices for clean HTML from images.

Landing pages:

- `/png-to-html`,
- `/screenshot-to-html`,
- `/image-to-html-css`,
- `/document-to-html`,
- `/invoice-to-html`,
- `/dashboard-screenshot-to-html`.

## Phase 4: agency and team sales

Goal: reach higher willingness to pay.

Targets:

- web agencies,
- outsourcing teams,
- SaaS frontend teams,
- product studios,
- document automation teams.

Offer:

- team workspace,
- more credits,
- batch conversion,
- custom presets,
- priority support,
- annual plan discount.

Outbound angle:

"We help teams convert client screenshots and legacy UI references into editable HTML faster. Want us to run your sample screenshot and show the result?"

## Phase 5: API waitlist

Goal: discover integration demand before building full API.

Waitlist questions:

- How many images per month?
- UI screenshots or documents?
- Need HTML, CSS, JSON, or screenshot comparison?
- Need private deployment?
- Which provider keys do you want to use?
- What compliance requirements exist?

## Activation funnel

Recommended flow:

1. User uploads screenshot.
2. User selects output preset.
3. AI generates preview.
4. User refines output.
5. User exports HTML.
6. App asks user to save project.
7. Account/signup happens after visible value.
8. Upgrade is triggered by credit limit, history, QA or team need.

Avoid forcing signup before first preview if possible. The product is visual; users need to see the output before trusting it.

## Metrics

### Acquisition

- visitors,
- upload started,
- upload completed,
- first generation started,
- successful preview,
- signup.

### Activation

- preview-to-export rate,
- refinement usage,
- copied code,
- downloaded HTML,
- saved project,
- second generation within 24 hours.

### Revenue

- free-to-paid conversion,
- MRR,
- ARPU,
- credit usage per user,
- gross margin per plan,
- refund rate,
- churn.

### Quality

- generation success rate,
- JSON repair rate,
- timeout rate,
- user refinement count,
- QA warning count,
- visual diff score later.

## Conversion goals

Early realistic targets:

- visitor-to-upload: 10-25 %,
- upload-to-preview: 70-85 %,
- preview-to-export: 25-45 %,
- export-to-signup: 10-20 %,
- free-to-paid: 3-8 %.

## Launch checklist

Before public launch:

- production smoke tests pass,
- provider failover works,
- rate limits configured,
- examples are anonymized,
- privacy policy drafted,
- pricing page live,
- clear credit limits,
- support email ready,
- basic analytics installed,
- error diagnostics visible to user.

## Early offers

Good initial offers:

- 50 % lifetime discount for first 50 Pro users,
- agency beta with direct support,
- BYOK free tier for developers,
- annual founding member plan,
- free conversion audit for agencies.

Avoid lifetime unlimited AI usage because it creates long-term cost risk.

## Sales objections

### "I can do this in ChatGPT."

Response: You can, but Visual HTML gives you the full workflow: upload, OCR, structured prompt, preview, refinement, export, QA and document-specific presets.

### "The output is not perfect."

Response: The goal is a fast editable starting point with transparent warnings and refinement. For dense documents, A4 and table fidelity are being optimized directly.

### "Is my screenshot private?"

Response: Offer BYOK, clear retention policy, deletion after processing, and enterprise/private options.

### "Why pay monthly?"

Response: Repeated conversions, project history, better presets, QA dashboard, support, and hosted AI workflow save ongoing developer time.
