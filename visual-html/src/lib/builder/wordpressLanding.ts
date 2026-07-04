import type { PromptItem } from "./types";

export const wordpressLandingPrompt: PromptItem = {
  id: "wordpress-landing",
  title: "WordPress Marketing Landing",
  description:
    "Semantic WordPress-style page with header nav, hero CTA, feature blocks, testimonial strip, and footer menu.",
  category: "landing",
  prompt:
    "Build a WordPress-style marketing landing page with semantic HTML5 and clean vanilla CSS: site header with logo and primary nav, full-width hero with headline and CTA, main content with feature grid and testimonial strip, and footer with menu and copyright. Use WordPress-friendly class names and accessible focus states.",
  mockCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LaunchPad — WordPress Landing</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #f8fafc;
      --text: #0f172a;
      --muted: #64748b;
      --brand: #5b35d5;
      --brand-hover: #4a2bb8;
      --card: #ffffff;
      --border: #e2e8f0;
      --hero: linear-gradient(135deg, #eef2ff 0%, #f8fafc 55%, #fdf4ff 100%);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, system-ui, sans-serif;
      color: var(--text);
      background: var(--bg);
      line-height: 1.6;
    }
    a { color: inherit; text-decoration: none; }
    .container { width: min(1120px, 92%); margin: 0 auto; }
    .site-header {
      position: sticky;
      top: 0;
      z-index: 20;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
    }
    .site-header .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 16px 0;
    }
    .site-brand {
      font-weight: 800;
      font-size: 1.1rem;
      letter-spacing: -0.02em;
    }
    .site-brand span { color: var(--brand); }
    .menu {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 20px;
      list-style: none;
      align-items: center;
    }
    .menu-item a {
      font-size: 0.92rem;
      color: var(--muted);
      padding: 6px 2px;
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s;
    }
    .menu-item a:hover,
    .menu-item a:focus-visible {
      color: var(--text);
      border-color: var(--brand);
      outline: none;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 10px 18px;
      font-weight: 600;
      font-size: 0.92rem;
      border: 1px solid transparent;
      cursor: pointer;
      transition: transform 0.15s, background 0.2s;
    }
    .btn:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
    .btn-primary { background: var(--brand); color: #fff; }
    .btn-primary:hover { background: var(--brand-hover); transform: translateY(-1px); }
    .btn-secondary {
      background: #fff;
      color: var(--text);
      border-color: var(--border);
    }
    .site-hero {
      background: var(--hero);
      padding: 72px 0 56px;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 40px;
      align-items: center;
    }
    .hero-copy h1 {
      font-size: clamp(2rem, 4vw, 3.2rem);
      line-height: 1.1;
      letter-spacing: -0.03em;
      margin-bottom: 16px;
    }
    .hero-copy p {
      color: var(--muted);
      max-width: 52ch;
      margin-bottom: 24px;
    }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }
    .hero-media {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 24px 60px rgba(15,23,42,0.08);
    }
    .hero-media .mock-window {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border);
      background: #fff;
    }
    .mock-bar {
      display: flex;
      gap: 6px;
      padding: 10px 12px;
      background: #f1f5f9;
      border-bottom: 1px solid var(--border);
    }
    .mock-dot { width: 10px; height: 10px; border-radius: 50%; background: #cbd5e1; }
    .mock-body {
      padding: 20px;
      display: grid;
      gap: 10px;
    }
    .mock-line { height: 10px; border-radius: 999px; background: #e2e8f0; }
    .mock-line.short { width: 65%; }
    .mock-line.brand { width: 45%; background: #ddd6fe; }
    .site-main { padding: 56px 0; }
    .wp-block-group { margin-bottom: 56px; }
    .section-title {
      text-align: center;
      margin-bottom: 28px;
    }
    .section-title h2 {
      font-size: clamp(1.5rem, 2.5vw, 2rem);
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .section-title p { color: var(--muted); }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }
    .feature-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 22px;
    }
    .feature-card h3 { font-size: 1rem; margin-bottom: 8px; }
    .feature-card p { color: var(--muted); font-size: 0.92rem; }
    .testimonial-strip {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 28px;
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 18px;
      align-items: center;
    }
    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #c4b5fd, #5b35d5);
      display: grid;
      place-items: center;
      color: #fff;
      font-weight: 700;
    }
    .testimonial-strip blockquote {
      font-size: 1.05rem;
      font-weight: 500;
      margin-bottom: 6px;
    }
    .testimonial-strip cite {
      font-style: normal;
      color: var(--muted);
      font-size: 0.9rem;
    }
    .site-footer {
      border-top: 1px solid var(--border);
      background: #fff;
      padding: 28px 0 36px;
      margin-top: 12px;
    }
    .footer-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px 28px;
      align-items: center;
      justify-content: space-between;
    }
    .footer-copy { color: var(--muted); font-size: 0.88rem; }
    @media (max-width: 860px) {
      .hero-grid { grid-template-columns: 1fr; }
      .features-grid { grid-template-columns: 1fr; }
      .menu { display: none; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="container">
      <a class="site-brand" href="#">Launch<span>Pad</span></a>
      <nav aria-label="Primary">
        <ul class="menu">
          <li class="menu-item"><a href="#">Home</a></li>
          <li class="menu-item"><a href="#">Features</a></li>
          <li class="menu-item"><a href="#">Pricing</a></li>
          <li class="menu-item"><a href="#">About</a></li>
          <li class="menu-item"><a href="#">Contact</a></li>
          <li class="menu-item"><a class="btn btn-primary" href="#">Get started</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <section class="site-hero">
    <div class="container hero-grid">
      <div class="hero-copy">
        <h1>Ship your WordPress landing page in hours, not weeks.</h1>
        <p>Semantic blocks, accessible navigation, and a conversion-focused hero — ready to customize for your next product launch.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#">Start free trial</a>
          <a class="btn btn-secondary" href="#">View demo</a>
        </div>
      </div>
      <div class="hero-media" aria-hidden="true">
        <div class="mock-window">
          <div class="mock-bar"><span class="mock-dot"></span><span class="mock-dot"></span><span class="mock-dot"></span></div>
          <div class="mock-body">
            <div class="mock-line brand"></div>
            <div class="mock-line"></div>
            <div class="mock-line short"></div>
            <div class="mock-line"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <main class="site-main">
    <div class="container">
      <section class="wp-block-group">
        <div class="section-title">
          <h2>Built for modern WordPress workflows</h2>
          <p>Block-friendly sections you can drop into any theme or static export.</p>
        </div>
        <div class="features-grid">
          <article class="feature-card">
            <h3>Semantic regions</h3>
            <p>Header, hero, main, and footer landmarks with accessible nav labels.</p>
          </article>
          <article class="feature-card">
            <h3>Mobile-first layout</h3>
            <p>Responsive grid that stacks cleanly on phones and tablets.</p>
          </article>
          <article class="feature-card">
            <h3>Theme-ready classes</h3>
            <p>Uses familiar WordPress naming: site-header, site-main, menu-item, and more.</p>
          </article>
        </div>
      </section>

      <section class="wp-block-group">
        <div class="testimonial-strip">
          <div class="avatar" aria-hidden="true">WP</div>
          <div>
            <blockquote>“This starter gave us a polished landing structure without fighting the theme.”</blockquote>
            <cite>— Alex Rivera, Product Marketing</cite>
          </div>
        </div>
      </section>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container footer-grid">
      <nav aria-label="Footer">
        <ul class="menu">
          <li class="menu-item"><a href="#">Privacy</a></li>
          <li class="menu-item"><a href="#">Terms</a></li>
          <li class="menu-item"><a href="#">Docs</a></li>
          <li class="menu-item"><a href="#">Support</a></li>
        </ul>
      </nav>
      <p class="footer-copy">© 2026 LaunchPad. WordPress-style landing starter template.</p>
    </div>
  </footer>
</body>
</html>`,
};
