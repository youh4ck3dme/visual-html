import type { PromptItem } from "./types";

export const memoryGamePrompt: PromptItem = {
  id: "memory-game",
  title: "Neon Card Memory Match",
  description:
    "A flip-and-match cards game featuring cyberpunk-themed symbols, animations, and matching streaks.",
  category: "games",
  prompt:
    "Build a matching card game on a dark screen with retro symbols. Include flip animations, move counting, matched cards persistent highlight, and win notification.",
  mockCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Memory</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #09090d;
      --card-back: linear-gradient(135deg, #1b0a2a, #05162a);
      --border: rgba(255,255,255,0.08);
      --glow-blue: #00f0ff;
      --glow-purple: #bd00ff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: #fff;
      font-family: 'Outfit', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-image: radial-gradient(circle at 50% 50%, #15102c 0%, var(--bg) 80%);
    }
    .container {
      width: 90%;
      max-width: 400px;
      text-align: center;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 8px;
      background: linear-gradient(135deg, var(--glow-blue), var(--glow-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      padding: 10px 20px;
      background: rgba(255,255,255,0.02);
      border-radius: 12px;
      border: 1px solid var(--border);
      font-family: 'Share Tech Mono', monospace;
      color: var(--glow-blue);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .card {
      aspect-ratio: 3/4;
      perspective: 1000px;
      cursor: pointer;
    }
    .card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
      transition: transform 0.5s;
      border-radius: 8px;
    }
    .card.flipped .card-inner {
      transform: rotateY(180deg);
    }
    .card-front, .card-back {
      position: absolute;
      width: 100%; height: 100%;
      backface-visibility: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .card-back {
      background: var(--card-back);
      color: var(--glow-blue);
      font-size: 20px;
    }
    .card-front {
      background: rgba(255,255,255,0.05);
      transform: rotateY(180deg);
      font-size: 28px;
      color: #fff;
    }
    .card.matched .card-inner {
      box-shadow: 0 0 10px var(--glow-purple);
      border-color: var(--glow-purple);
    }
    .btn {
      background: linear-gradient(135deg, var(--glow-blue), var(--glow-purple));
      color: white;
      border: none;
      padding: 12px 24px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
      box-shadow: 0 4px 15px rgba(0, 240, 255, 0.2);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>NEON MEMORY MATCH</h1>
    <div class="stats">
      <span>MOVES: <span id="moves">0</span></span>
      <span>TIME: <span id="time">00:00</span></span>
    </div>
    
    <div class="grid" id="grid"></div>

    <button class="btn" id="resetBtn">RESET GAME</button>
  </div>

  <script>
    const gridEl = document.getElementById('grid');
    const movesEl = document.getElementById('moves');
    const timeEl = document.getElementById('time');
    const resetBtn = document.getElementById('resetBtn');

    const icons = ['👾', '🚀', '💿', '💾', '💎', '🔑', '💡', '🔋'];
    let deck = [...icons, ...icons];
    let flippedCards = [];
    let moves = 0;
    let seconds = 0;
    let timer = null;
    let matchedCount = 0;

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[array.length - 1]] = [array[array.length - 1], array[i]]; // wait, simpler:
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    }

    function startTimer() {
      clearInterval(timer);
      seconds = 0;
      timer = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        timeEl.innerText = \`\${mins}:\${secs}\`;
      }, 1000);
    }

    function createBoard() {
      gridEl.innerHTML = '';
      shuffle(deck);
      deck.forEach((icon, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.name = icon;
        card.dataset.index = index;
        card.innerHTML = \`
          <div class="card-inner">
            <div class="card-back">?</div>
            <div class="card-front">\${icon}</div>
          </div>
        \`;
        card.addEventListener('click', flipCard);
        gridEl.appendChild(card);
      });
      moves = 0;
      movesEl.innerText = moves;
      matchedCount = 0;
      flippedCards = [];
      startTimer();
    }

    function flipCard() {
      if (this.classList.contains('flipped') || this.classList.contains('matched') || flippedCards.length >= 2) return;

      this.classList.add('flipped');
      flippedCards.push(this);

      if (flippedCards.length === 2) {
        moves++;
        movesEl.innerText = moves;
        checkMatch();
      }
    }

    function checkMatch() {
      const [card1, card2] = flippedCards;
      if (card1.dataset.name === card2.dataset.name) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedCount += 2;
        flippedCards = [];
        if (matchedCount === deck.length) {
          clearInterval(timer);
          setTimeout(() => alert(\`Winner! Completed in \${moves} moves.\`), 500);
        }
      } else {
        setTimeout(() => {
          card1.classList.remove('flipped');
          card2.classList.remove('flipped');
          flippedCards = [];
        }, 1000);
      }
    }

    resetBtn.addEventListener('click', createBoard);
    createBoard();
  </script>
</body>
</html>`,
};
