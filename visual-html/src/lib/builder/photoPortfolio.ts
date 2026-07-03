import type { PromptItem } from "./types";

export const photoPortfolioPrompt: PromptItem = {
  id: "photo-portfolio",
  title: "Photographer Lightbox Showcase",
  description:
    "Minimal gallery featuring high contrast grid layout, dynamic photo categories, and responsive image viewer overlay.",
  category: "portfolios",
  prompt:
    "Design a luxury minimalist photographer portfolio with grid filtering (Nature, Studio, Street), fluid image hovers, and a lightbox viewer when clicking photos.",
  mockCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aura Photography</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #050505;
      --card: rgba(255, 255, 255, 0.02);
      --border: rgba(255, 255, 255, 0.06);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: #fff;
      font-family: 'Outfit', sans-serif;
      overflow-x: hidden;
    }
    header {
      padding: 40px 24px;
      text-align: center;
      max-width: 1000px;
      margin: 0 auto;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 4px;
      margin-bottom: 8px;
    }
    p.subtitle {
      font-size: 14px;
      letter-spacing: 2px;
      color: #666;
      text-transform: uppercase;
    }
    .filters {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 30px 0;
    }
    .filter-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: #888;
      padding: 8px 16px;
      border-radius: 30px;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.3s;
    }
    .filter-btn.active, .filter-btn:hover {
      color: #fff;
      border-color: #fff;
      background: rgba(255,255,255,0.05);
    }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      max-width: 960px;
      margin: 0 auto;
      padding: 0 24px 60px;
    }
    .gallery-item {
      position: relative;
      aspect-ratio: 4/3;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s;
    }
    .gallery-item:hover {
      transform: scale(1.02);
      border-color: rgba(255,255,255,0.2);
    }
    .image-frame {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      transition: transform 0.45s ease, filter 0.45s ease;
    }
    .gallery-item:hover .image-frame {
      transform: scale(1.06);
      filter: saturate(1.08) contrast(1.05);
    }
    .image-frame::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.72));
    }
    .nature-1 {
      background-image:
        radial-gradient(circle at 30% 18%, rgba(198,255,190,.55), transparent 16%),
        radial-gradient(circle at 70% 70%, rgba(26,117,74,.65), transparent 28%),
        linear-gradient(135deg, #0f2f24, #06110e 58%, #1f3d2f);
    }
    .nature-2 {
      background-image:
        radial-gradient(circle at 20% 72%, rgba(255,180,92,.55), transparent 18%),
        radial-gradient(circle at 75% 25%, rgba(58,128,82,.5), transparent 24%),
        linear-gradient(145deg, #2f2515, #08120e 60%, #6f4421);
    }
    .studio-1 {
      background-image:
        radial-gradient(ellipse at 55% 28%, rgba(255,255,255,.72), transparent 20%),
        radial-gradient(circle at 50% 52%, rgba(180,190,205,.32), transparent 25%),
        linear-gradient(160deg, #17191f, #050507 64%, #40392f);
    }
    .studio-2 {
      background-image:
        radial-gradient(circle at 35% 34%, rgba(185,138,255,.52), transparent 20%),
        radial-gradient(circle at 68% 64%, rgba(255,112,178,.28), transparent 26%),
        linear-gradient(135deg, #160f24, #070609 62%, #2b1b3c);
    }
    .street-1 {
      background-image:
        linear-gradient(90deg, rgba(255,255,255,.12) 0 1px, transparent 1px 24%),
        radial-gradient(circle at 28% 64%, rgba(0,219,255,.42), transparent 18%),
        linear-gradient(135deg, #08151f, #030405 58%, #182b36);
    }
    .street-2 {
      background-image:
        radial-gradient(circle at 64% 25%, rgba(255,204,94,.46), transparent 16%),
        radial-gradient(circle at 30% 76%, rgba(255,77,109,.32), transparent 22%),
        linear-gradient(150deg, #20110b, #070505 64%, #3f2815);
    }
    .caption {
      position: absolute;
      left: 16px;
      right: 16px;
      bottom: 16px;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: end;
    }
    .gallery-item span.tag {
      background: rgba(0,0,0,0.7);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      letter-spacing: 1px;
      text-transform: uppercase;
      border: 1px solid var(--border);
    }
    .caption strong {
      font-size: 15px;
      letter-spacing: 0.4px;
    }
    /* Lightbox */
    .lightbox {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.95);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0; pointer-events: none;
      transition: opacity 0.3s;
    }
    .lightbox.active {
      opacity: 1; pointer-events: auto;
    }
    .lightbox-content {
      width: min(82vw, 860px);
      height: min(66vh, 620px);
      background-size: cover;
      background-position: center;
      border-radius: 18px;
      border: 1px solid rgba(255,255,255,.16);
      box-shadow: 0 30px 80px rgba(0,0,0,.65);
      margin-bottom: 20px;
    }
    .lightbox-close {
      position: absolute;
      top: 30px; right: 30px;
      font-size: 24px;
      cursor: pointer;
      color: #888;
    }
  </style>
</head>
<body>
  <header>
    <h1>AURA PORTRAIT</h1>
    <p class="subtitle">VISUAL STORIES BY AURA</p>
    <div class="filters">
      <button class="filter-btn active" data-filter="all">ALL</button>
      <button class="filter-btn" data-filter="nature">NATURE</button>
      <button class="filter-btn" data-filter="studio">STUDIO</button>
      <button class="filter-btn" data-filter="street">STREET</button>
    </div>
  </header>

  <div class="gallery" id="gallery">
    <div class="gallery-item" data-category="nature">
      <div class="image-frame nature-1"></div>
      <div class="caption"><strong>Moss Valley</strong><span class="tag">NATURE</span></div>
    </div>
    <div class="gallery-item" data-category="studio">
      <div class="image-frame studio-1"></div>
      <div class="caption"><strong>Soft Profile</strong><span class="tag">STUDIO</span></div>
    </div>
    <div class="gallery-item" data-category="street">
      <div class="image-frame street-1"></div>
      <div class="caption"><strong>Blue Block</strong><span class="tag">STREET</span></div>
    </div>
    <div class="gallery-item" data-category="nature">
      <div class="image-frame nature-2"></div>
      <div class="caption"><strong>Pine Walk</strong><span class="tag">NATURE</span></div>
    </div>
    <div class="gallery-item" data-category="studio">
      <div class="image-frame studio-2"></div>
      <div class="caption"><strong>Glass Hour</strong><span class="tag">STUDIO</span></div>
    </div>
    <div class="gallery-item" data-category="street">
      <div class="image-frame street-2"></div>
      <div class="caption"><strong>Night Crossing</strong><span class="tag">STREET</span></div>
    </div>
  </div>

  <div class="lightbox" id="lightbox">
    <span class="lightbox-close" id="closeBtn">✕</span>
    <div class="lightbox-content" id="lightboxImage"></div>
    <h2 id="lightboxTitle">STREET</h2>
  </div>

  <script>
    const filterBtns = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const closeBtn = document.getElementById('closeBtn');

    // Filtering
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle active button
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        items.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // Lightbox
    items.forEach(item => {
      item.addEventListener('click', () => {
        const image = item.querySelector('.image-frame');
        const tag = item.querySelector('.tag').innerText;
        lightboxImage.style.backgroundImage = getComputedStyle(image).backgroundImage;
        lightboxTitle.innerText = tag;
        lightbox.classList.add('active');
      });
    });

    closeBtn.addEventListener('click', () => {
      lightbox.classList.remove('active');
    });

    lightbox.addEventListener('click', (e) => {
      if(e.target === lightbox) lightbox.classList.remove('active');
    });
  </script>
</body>
</html>`,
};
