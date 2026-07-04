export const APP_ICON = {
  faviconIco: "/favicon.ico",
  favicon16: "/favicon-16x16.png",
  favicon32: "/favicon-32x32.png",
  appleTouch: "/apple-touch-icon.png",
  android192: "/android-chrome-192x192.png",
  android512: "/android-chrome-512x512.png",
  manifest: "/site.webmanifest",
  electron: "/icon.png",
  circuitPattern: "/vibecraft-circuit.svg",
} as const;

/** Bump when replacing favicon/PWA assets so browsers pick up the new pack. */
export const APP_ICON_VERSION = "4";

export function appIconHref(path: string): string {
  return `${path}?v=${APP_ICON_VERSION}`;
}

export const APP_HEAD_LINKS = [
  { rel: "apple-touch-icon", sizes: "180x180", href: appIconHref(APP_ICON.appleTouch) },
  { rel: "apple-touch-icon-precomposed", sizes: "180x180", href: appIconHref(APP_ICON.appleTouch) },
  { rel: "icon", type: "image/png", sizes: "32x32", href: appIconHref(APP_ICON.favicon32) },
  { rel: "icon", type: "image/png", sizes: "16x16", href: appIconHref(APP_ICON.favicon16) },
  { rel: "icon", href: appIconHref(APP_ICON.faviconIco), sizes: "any" },
  { rel: "manifest", href: appIconHref(APP_ICON.manifest) },
] as const;

export const APP_PWA_META = [
  { name: "application-name", content: "PNGtoHTML" },
  { name: "mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
  { name: "msapplication-TileColor", content: "#000000" },
  { name: "msapplication-TileImage", content: appIconHref(APP_ICON.android512) },
] as const;

export function appHeadLinkTags(): string {
  return APP_HEAD_LINKS.map((link) => {
    const attrs = [
      `rel="${link.rel}"`,
      "href" in link ? `href="${link.href}"` : "",
      "sizes" in link && link.sizes ? `sizes="${link.sizes}"` : "",
      "type" in link && link.type ? `type="${link.type}"` : "",
    ]
      .filter(Boolean)
      .join(" ");
    return `    <link ${attrs} />`;
  }).join("\n");
}