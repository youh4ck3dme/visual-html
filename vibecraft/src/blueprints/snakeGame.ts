import type { PromptItem } from './types';

export const snakeGamePrompt: PromptItem = {
    id: 'snake-game',
    title: 'Retro Snake Game',
    description: 'Fully playable classic Snake game with retro canvas aesthetics, score tracker, and mobile controls.',
    category: 'games',
    prompt: 'Create a retro arcade Snake game with a dark grid container, neon green snake, purple food, score counter, start/restart screen, and virtual D-pad buttons for mobile users.',
    mockCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Retro Neon Snake</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #09090e;
      --card: rgba(255, 255, 255, 0.03);
      --border: rgba(255, 255, 255, 0.08);
      --neon-green: #39ff14;
      --neon-purple: #bd00ff;
      --neon-blue: #00f0ff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: #fff;
      font-family: 'Outfit', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
      background-image: radial-gradient(circle at 50% 50%, #15102a 0%, var(--bg) 70%);
    }
    .container {
      background: var(--card);
      border: 1px solid var(--border);
      backdrop-filter: blur(12px);
      border-radius: 20px;
      padding: 24px;
      width: 90%;
      max-width: 440px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 8px;
      background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 1px;
    }
    .score-container {
      font-family: 'Share Tech Mono', monospace;
      font-size: 18px;
      color: var(--neon-blue);
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 16px;
      padding: 8px 16px;
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    canvas {
      background: #000;
      border: 2px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 0 15px rgba(189, 0, 255, 0.15);
      display: block;
    }
    .overlay {
      position: absolute;
      background: rgba(9, 9, 14, 0.85);
      top: 0; left: 0; width: 100%; height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      opacity: 1;
      transition: opacity 0.3s;
    }
    .overlay.hidden { display: none; }
    .btn {
      background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
      color: white;
      border: none;
      padding: 12px 24px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      font-family: 'Outfit', sans-serif;
      box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
      transition: all 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(189, 0, 255, 0.4);
    }
    .controls {
      display: grid;
      grid-template-columns: repeat(3, 50px);
      grid-template-rows: repeat(3, 50px);
      gap: 8px;
      margin-top: 16px;
    }
    .dpad-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      color: white;
      font-size: 20px;
      font-weight: bold;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
    .dpad-btn:active {
      background: var(--neon-blue);
      box-shadow: 0 0 10px var(--neon-blue);
    }
    #up { grid-column: 2; }
    #left { grid-column: 1; grid-row: 2; }
    #right { grid-column: 3; grid-row: 2; }
    #down { grid-column: 2; grid-row: 3; }
  </style>
</head>
<body>
  <div class="container">
    <h1>NEON SNAKE GAME</h1>
    <div class="score-container">
      <span>SCORE: <span id="score">0</span></span>
      <span>HIGH: <span id="highScore">0</span></span>
    </div>
    <div style="position: relative; width: 300px; height: 300px;">
      <canvas id="gameCanvas" width="300" height="300"></canvas>
      <div id="startOverlay" class="overlay">
        <h2 style="margin-bottom:16px; font-family:'Share Tech Mono'; color:var(--neon-green)">READY TO PLAY?</h2>
        <button class="btn" id="startBtn">START GAME</button>
      </div>
      <div id="gameOverOverlay" class="overlay hidden">
        <h2 style="margin-bottom:8px; color:#ff4a4a; font-family:'Share Tech Mono'">GAME OVER</h2>
        <p style="margin-bottom:16px; font-size:14px; color:#aaa">Score was <span id="finalScore">0</span></p>
        <button class="btn" id="restartBtn">PLAY AGAIN</button>
      </div>
    </div>
    
    <!-- Mobile Controls -->
    <div class="controls">
      <button class="dpad-btn" id="up">▲</button>
      <button class="dpad-btn" id="left">◀</button>
      <button class="dpad-btn" id="right">▶</button>
      <button class="dpad-btn" id="down">▼</button>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('highScore');
    const startOverlay = document.getElementById('startOverlay');
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');
    const finalScoreEl = document.getElementById('finalScore');

    const grid = 15;
    let snake = [];
    let food = { x: 0, y: 0 };
    let dx = grid;
    let dy = 0;
    let score = 0;
    let highScore = localStorage.getItem('snake_high') || 0;
    highScoreEl.innerText = highScore;
    let gameInterval = null;
    let isPlaying = false;

    function resetGame() {
      snake = [
        { x: grid * 5, y: grid * 5 },
        { x: grid * 4, y: grid * 5 },
        { x: grid * 3, y: grid * 5 }
      ];
      dx = grid;
      dy = 0;
      score = 0;
      scoreEl.innerText = score;
      spawnFood();
    }

    function spawnFood() {
      const maxGridX = canvas.width / grid - 1;
      const maxGridY = canvas.height / grid - 1;
      food.x = Math.floor(Math.random() * maxGridX) * grid;
      food.y = Math.floor(Math.random() * maxGridY) * grid;
      
      // Make sure food is not on snake
      for (let cell of snake) {
        if (cell.x === food.x && cell.y === food.y) {
          spawnFood();
          break;
        }
      }
    }

    function draw() {
      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines subtly
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      for(let i=0; i<canvas.width; i+=grid) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      // Draw Food
      ctx.fillStyle = '#bd00ff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#bd00ff';
      ctx.beginPath();
      ctx.arc(food.x + grid/2, food.y + grid/2, grid/2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Snake
      snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#39ff14' : '#22b809';
        ctx.shadowBlur = index === 0 ? 6 : 0;
        ctx.shadowColor = '#39ff14';
        ctx.fillRect(part.x + 1, part.y + 1, grid - 2, grid - 2);
      });
      ctx.shadowBlur = 0;
    }

    function update() {
      // Move snake head
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };

      // Check wall collision
      if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        endGame();
        return;
      }

      // Check self collision
      for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          endGame();
          return;
        }
      }

      // Add new head
      snake.unshift(head);

      // Check food eating
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.innerText = score;
        if (score > highScore) {
          highScore = score;
          highScoreEl.innerText = highScore;
          localStorage.setItem('snake_high', highScore);
        }
        spawnFood();
      } else {
        // Remove tail
        snake.pop();
      }
    }

    function gameLoop() {
      update();
      draw();
    }

    function startGame() {
      resetGame();
      isPlaying = true;
      startOverlay.classList.add('hidden');
      gameOverOverlay.classList.add('hidden');
      if(gameInterval) clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, 120);
    }

    function endGame() {
      isPlaying = false;
      clearInterval(gameInterval);
      finalScoreEl.innerText = score;
      gameOverOverlay.classList.remove('hidden');
    }

    // Direction handlers
    function changeDirection(dir) {
      if (!isPlaying) return;
      if (dir === 'UP' && dy === 0) { dx = 0; dy = -grid; }
      else if (dir === 'DOWN' && dy === 0) { dx = 0; dy = grid; }
      else if (dir === 'LEFT' && dx === 0) { dx = -grid; dy = 0; }
      else if (dir === 'RIGHT' && dx === 0) { dx = grid; dy = 0; }
    }

    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' || e.key === 'w') changeDirection('UP');
      else if (e.key === 'ArrowDown' || e.key === 's') changeDirection('DOWN');
      else if (e.key === 'ArrowLeft' || e.key === 'a') changeDirection('LEFT');
      else if (e.key === 'ArrowRight' || e.key === 'd') changeDirection('RIGHT');
    });

    // Mobile controls setup
    document.getElementById('up').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('UP') });
    document.getElementById('down').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('DOWN') });
    document.getElementById('left').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('LEFT') });
    document.getElementById('right').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('RIGHT') });

    document.getElementById('up').addEventListener('click', () => changeDirection('UP'));
    document.getElementById('down').addEventListener('click', () => changeDirection('DOWN'));
    document.getElementById('left').addEventListener('click', () => changeDirection('LEFT'));
    document.getElementById('right').addEventListener('click', () => changeDirection('RIGHT'));

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    // Initial clear
    draw();
  </script>
</body>
</html>`
};
