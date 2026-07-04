import { describe, expect, it } from "vitest";

import { buildSingleFileHtml } from "@/lib/utils/build-single-file-html";

function build(html: string, allowJs = false) {
  return buildSingleFileHtml({ html, css: "", javascript: "" }, { allowJs });
}

describe("buildSingleFileHtml sanitization (allowJs = false)", () => {
  it("strips injected <script> tags", () => {
    const out = build(`<div>hi</div><script>window.__pwned = 1;</script>`);
    expect(out.toLowerCase()).not.toContain("<script");
    expect(out).not.toContain("__pwned");
    expect(out).toContain("hi");
  });

  it("removes inline event handlers like onerror", () => {
    const out = build(`<img src="x" onerror="alert(document.cookie)" alt="x">`);
    expect(out).not.toMatch(/onerror/i);
    expect(out).not.toContain("alert(document.cookie)");
  });

  it("neutralizes javascript: URLs in href", () => {
    const out = build(`<a href="javascript:alert(1)">click</a>`);
    expect(out.toLowerCase()).not.toContain("javascript:alert");
  });

  it("removes SVG onload script vectors", () => {
    const out = build(`<svg><circle r="10" /><g onload="alert(1)"></g></svg>`);
    expect(out).not.toMatch(/onload/i);
    expect(out).not.toContain("alert(1)");
  });

  it("drops smuggled iframe srcdoc payloads", () => {
    const out = build(`<iframe srcdoc="<script>alert(1)</script>"></iframe>`);
    expect(out.toLowerCase()).not.toContain("srcdoc");
    expect(out.toLowerCase()).not.toContain("<iframe");
  });

  it("keeps benign semantic markup intact", () => {
    const out = build(`<section><h1>Title</h1><p>Body</p></section>`);
    expect(out).toContain("<h1>Title</h1>");
    expect(out).toContain("<p>Body</p>");
  });

  it("sanitizes full documents too", () => {
    const out = buildSingleFileHtml(
      {
        html: `<!doctype html><html><body><p>ok</p><script>steal()</script></body></html>`,
        css: "",
        javascript: "",
      },
      { allowJs: false },
    );
    expect(out.toLowerCase()).not.toContain("<script");
    expect(out).not.toContain("steal()");
    expect(out).toContain("ok");
  });

  it("injects CSS and missing metadata into full documents", () => {
    const out = buildSingleFileHtml(
      {
        html: `<html><head><title>x</title></head><body><div class="header">A</div></body></html>`,
        css: `.header{color:red}`,
        javascript: "",
      },
      { allowJs: false },
    );

    expect(out).toMatch(/<!doctype html>/i);
    expect(out).toMatch(/<meta[^>]+charset/i);
    expect(out).toMatch(/name="viewport"/i);
    expect(out).toContain("<style>");
    expect(out).toContain(".header{color:red}");
    expect(out.indexOf(".header{color:red}")).toBeLessThan(out.indexOf("</head>"));
  });
});

describe("buildSingleFileHtml JS mode (allowJs = true)", () => {
  it("keeps opted-in JS but escapes </script> breakout", () => {
    const out = buildSingleFileHtml(
      { html: `<div id="app"></div>`, css: "", javascript: `console.log("</script><img>")` },
      { allowJs: true },
    );
    // The intentional script block is present...
    expect(out).toContain("<script>");
    // ...but the breakout sequence inside the JS string is escaped.
    expect(out).toContain("<\\/script>");
    expect(out).not.toContain(`log("</script>`);
  });

  it("keeps CSS in full documents when JS preview is enabled", () => {
    const out = buildSingleFileHtml(
      {
        html: `<html><head></head><body><div class="header">A</div></body></html>`,
        css: `.header{color:red}`,
        javascript: "",
      },
      { allowJs: true },
    );

    expect(out).toContain(".header{color:red}");
    expect(out.indexOf(".header{color:red}")).toBeLessThan(out.indexOf("</head>"));
  });
});
