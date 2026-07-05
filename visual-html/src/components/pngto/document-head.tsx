import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { useT } from "@/hooks/use-t";
import type { MessageKey } from "@/lib/i18n/messages";

type PageHeadKey = "index" | "projects" | "builder" | "root";

function resolvePageHeadKey(pathname: string): PageHeadKey {
  if (pathname === "/") return "index";
  if (pathname === "/projects" || pathname.startsWith("/projects/")) return "projects";
  if (pathname === "/builder") return "builder";
  return "root";
}

function setMetaContent(selector: string, createAttr: [string, string], content: string) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(createAttr[0], createAttr[1]);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function DocumentHead() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t, locale } = useT();
  const page = resolvePageHeadKey(pathname);

  useEffect(() => {
    document.title = t(`meta.${page}.title` as MessageKey);

    setMetaContent(
      'meta[name="description"]',
      ["name", "description"],
      t(`meta.${page}.description` as MessageKey),
    );
    setMetaContent(
      'meta[property="og:title"]',
      ["property", "og:title"],
      t(`meta.${page}.ogTitle` as MessageKey),
    );
    setMetaContent(
      'meta[property="og:description"]',
      ["property", "og:description"],
      t(`meta.${page}.ogDescription` as MessageKey),
    );
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    let linkEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.rel = "canonical";
      document.head.appendChild(linkEl);
    }
    linkEl.href = `${origin}${pathname}`;
    setMetaContent('meta[property="og:url"]', ["property", "og:url"], `${origin}${pathname}`);
    document.documentElement.lang = locale;
  }, [locale, page, pathname, t]);

  return null;
}
