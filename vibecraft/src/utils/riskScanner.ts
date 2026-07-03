export type RiskLevel = 'warning' | 'danger';

export interface HtmlRisk {
  id: string;
  level: RiskLevel;
  label: string;
  detail: string;
}

const ALLOWED_SCRIPT_HOSTS = new Set([
  'cdn.tailwindcss.com',
  'unpkg.com',
  'cdn.jsdelivr.net',
]);

const createRisk = (label: string, detail: string, level: RiskLevel = 'warning'): HtmlRisk => ({
  id: `${label}-${detail}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  label,
  detail,
  level,
});

export const scanGeneratedHtml = (code: string): HtmlRisk[] => {
  if (!code.trim()) return [];

  const risks: HtmlRisk[] = [];
  const scriptSourcePattern = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let scriptMatch: RegExpExecArray | null;

  while ((scriptMatch = scriptSourcePattern.exec(code)) !== null) {
    const source = scriptMatch[1];

    try {
      const url = new URL(source, 'https://local.vibecraft.invalid');
      if (url.hostname && !ALLOWED_SCRIPT_HOSTS.has(url.hostname)) {
        risks.push(createRisk('External script', `${url.hostname}${url.pathname}`, 'danger'));
      }
    } catch {
      risks.push(createRisk('External script', source, 'danger'));
    }
  }

  const inlineHandlerMatches = code.match(/\son[a-z]+\s*=/gi) || [];
  if (inlineHandlerMatches.length > 0) {
    risks.push(createRisk('Inline event handlers', `${inlineHandlerMatches.length} handler attribute(s) found`));
  }

  if (/<iframe\b/i.test(code)) {
    risks.push(createRisk('Nested iframe', 'Generated HTML contains an iframe element'));
  }

  const secretPatterns = [
    /AIza[0-9A-Za-z_-]{25,}/g,
    /sk-[0-9A-Za-z_-]{24,}/g,
    /ghp_[0-9A-Za-z]{24,}/g,
    /[A-Za-z0-9_-]{32,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g,
  ];

  if (secretPatterns.some((pattern) => pattern.test(code))) {
    risks.push(createRisk('Possible secret', 'Code contains a string that resembles an API key or token', 'danger'));
  }

  return Array.from(new Map(risks.map((risk) => [risk.id, risk])).values());
};
