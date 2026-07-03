type Web24hSection = {
  id: string;
  type: string;
  heading: string;
  body: string;
  bullets: string[];
  cta: { label: string; href: string } | null;
};

type Web24hPage = {
  slug: string;
  title: string;
  sections: Web24hSection[];
};

export type Web24hPayload = {
  brand: {
    name: string;
    tagline?: string;
    primaryColor?: string;
  };
  pages: Web24hPage[];
  cta: { label: string; href: string };
  seo: {
    title: string;
    description: string;
    ogTitle?: string;
    ogDescription?: string;
  };
  assets?: string[];
  wordpressPayload?: Record<string, unknown>;
};

export type RenderRequest = {
  schemaVersion: 'web24h_v1';
  payload: Web24hPayload;
  options?: {
    theme?: string;
    locale?: string;
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const cleanString = (value: unknown, maxLen = 5_000): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLen) : '';

const isSafeHref = (href: string): boolean => {
  if (!href) return false;
  const lower = href.toLowerCase();
  if (lower.startsWith('javascript:')) return false;
  if (lower.startsWith('data:')) return false;
  return true;
};

const looksLikeHexColor = (value: string): boolean =>
  /^#[0-9a-f]{3,8}$/i.test(value);

export const validateRenderRequest = (
  input: unknown
): { ok: true; value: RenderRequest } | { ok: false; message: string } => {
  if (!isRecord(input)) {
    return { ok: false, message: 'Body must be a JSON object.' };
  }

  if (input.schemaVersion !== 'web24h_v1') {
    return { ok: false, message: 'schemaVersion must equal web24h_v1.' };
  }

  const payloadRaw = input.payload;
  if (!isRecord(payloadRaw)) {
    return { ok: false, message: 'payload is required and must be an object.' };
  }

  const brandRaw = payloadRaw.brand;
  if (!isRecord(brandRaw)) {
    return { ok: false, message: 'payload.brand is required.' };
  }
  const brandName = cleanString(brandRaw.name, 160);
  if (!brandName) {
    return { ok: false, message: 'payload.brand.name is required.' };
  }
  const brandTagline = cleanString(brandRaw.tagline, 240);
  const primaryColor = cleanString(brandRaw.primaryColor, 16);
  if (primaryColor && !looksLikeHexColor(primaryColor)) {
    return { ok: false, message: 'payload.brand.primaryColor must be a hex color.' };
  }

  const pagesRaw = payloadRaw.pages;
  if (!Array.isArray(pagesRaw) || pagesRaw.length === 0 || pagesRaw.length > 10) {
    return { ok: false, message: 'payload.pages must contain 1-10 pages.' };
  }

  const pages: Web24hPage[] = [];
  for (const pageRaw of pagesRaw) {
    if (!isRecord(pageRaw)) {
      return { ok: false, message: 'Each page must be an object.' };
    }

    const slug = cleanString(pageRaw.slug, 120);
    const title = cleanString(pageRaw.title, 160);
    if (!slug || !title) {
      return { ok: false, message: 'Each page requires slug and title.' };
    }

    const sectionsRaw = pageRaw.sections;
    if (!Array.isArray(sectionsRaw) || sectionsRaw.length === 0 || sectionsRaw.length > 100) {
      return { ok: false, message: 'Each page.sections must contain 1-100 sections.' };
    }

    const sections: Web24hSection[] = [];
    for (const sectionRaw of sectionsRaw) {
      if (!isRecord(sectionRaw)) {
        return { ok: false, message: 'Each section must be an object.' };
      }

      const id = cleanString(sectionRaw.id, 80);
      const type = cleanString(sectionRaw.type, 80);
      const heading = cleanString(sectionRaw.heading, 240);
      const body = cleanString(sectionRaw.body, 10_000);
      if (!id || !type || !heading || !body) {
        return { ok: false, message: 'Each section requires id, type, heading, and body.' };
      }

      const bulletsRaw = sectionRaw.bullets;
      const bullets = Array.isArray(bulletsRaw)
        ? bulletsRaw.map((item) => cleanString(item, 500)).filter(Boolean).slice(0, 20)
        : [];

      let cta: { label: string; href: string } | null = null;
      if (sectionRaw.cta !== null && sectionRaw.cta !== undefined) {
        if (!isRecord(sectionRaw.cta)) {
          return { ok: false, message: 'section.cta must be an object or null.' };
        }
        const label = cleanString(sectionRaw.cta.label, 120);
        const href = cleanString(sectionRaw.cta.href, 500);
        if (!label || !href || !isSafeHref(href)) {
          return { ok: false, message: 'section.cta requires safe label and href.' };
        }
        cta = { label, href };
      }

      sections.push({ id, type, heading, body, bullets, cta });
    }

    pages.push({ slug, title, sections });
  }

  const ctaRaw = payloadRaw.cta;
  if (!isRecord(ctaRaw)) {
    return { ok: false, message: 'payload.cta is required.' };
  }
  const ctaLabel = cleanString(ctaRaw.label, 120);
  const ctaHref = cleanString(ctaRaw.href, 500);
  if (!ctaLabel || !ctaHref || !isSafeHref(ctaHref)) {
    return { ok: false, message: 'payload.cta requires safe label and href.' };
  }

  const seoRaw = payloadRaw.seo;
  if (!isRecord(seoRaw)) {
    return { ok: false, message: 'payload.seo is required.' };
  }
  const seoTitle = cleanString(seoRaw.title, 200);
  const seoDescription = cleanString(seoRaw.description, 600);
  if (!seoTitle || !seoDescription) {
    return { ok: false, message: 'payload.seo requires title and description.' };
  }
  const ogTitle = cleanString(seoRaw.ogTitle, 200);
  const ogDescription = cleanString(seoRaw.ogDescription, 600);

  const assetsRaw = payloadRaw.assets;
  const assets = Array.isArray(assetsRaw)
    ? assetsRaw
        .map((value) => cleanString(value, 1_000))
        .filter((value) => value.startsWith('https://') || value.startsWith('/'))
        .slice(0, 40)
    : [];

  const wordpressPayload = isRecord(payloadRaw.wordpressPayload) ? payloadRaw.wordpressPayload : {};
  const optionsRaw = isRecord(input.options) ? input.options : {};

  return {
    ok: true,
    value: {
      schemaVersion: 'web24h_v1',
      payload: {
        brand: {
          name: brandName,
          tagline: brandTagline || undefined,
          primaryColor: primaryColor || undefined,
        },
        pages,
        cta: { label: ctaLabel, href: ctaHref },
        seo: {
          title: seoTitle,
          description: seoDescription,
          ogTitle: ogTitle || undefined,
          ogDescription: ogDescription || undefined,
        },
        assets,
        wordpressPayload,
      },
      options: {
        theme: cleanString(optionsRaw.theme, 60) || undefined,
        locale: cleanString(optionsRaw.locale, 20) || undefined,
      },
    },
  };
};
