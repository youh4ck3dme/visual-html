import type { PromptItem } from "./types";

export const ticTacToePrompt: PromptItem = {
  id: "tic-tac-toe",
  title: "Tic-Tac-Toe vs Smart AI",
  description:
    "Play Tic-Tac-Toe against an AI opponent featuring smooth scaling grid items and winning animation.",
  category: "games",
  prompt:
    "Create a Tic-Tac-Toe game where the player plays as X against an intelligent AI (O). Make the grid responsive, glassmorphic, and add score tracking plus win streak counts.",
  mockCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyber Tic Tac Toe</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0d0d12;
      --card: rgba(255, 255, 255, 0.03);
      --border: rgba(255, 255, 255, 0.08);
      --color-x: #ff007f;
      --color-o: #00f0ff;
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
      background-image: radial-gradient(circle at 50% 50%, #1e1335 0%, var(--bg) 80%);
    }
    .wrapper {
      background: var(--card);
      border: 1px solid var(--border);
      backdrop-filter: blur(15px);
      border-radius: 24px;
      padding: 30px;
      width: 90%;
      max-width: 380px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
      text-align: center;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 20px;
      background: linear-gradient(135deg, var(--color-x), var(--color-o));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .scores {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;
      background: rgba(0,0,0,0.3);
      padding: 12px;
      border-radius: 12px;
      border: 1px solid var(--border);
      font-size: 14px;
    }
    .score-block span { display: block; font-weight: 600; margin-top: 4px; font-size: 18px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .cell {
      aspect-ratio: 1;
      background: rgba(255,255,255,0.02);
      border: 1px solid var(--border);
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: 800;
      transition: all 0.2s;
      user-select: none;
    }
    .cell:hover {
      background: rgba(255,255,255,0.05);
    }
    .cell.x { color: var(--color-x); text-shadow: 0 0 10px rgba(255,0,127,0.5); }
    .cell.o { color: var(--color-o); text-shadow: 0 0 10px rgba(0,240,255,0.5); }
    .status {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
      min-height: 24px;
      color: #aaa;
    }
    .status.highlight { color: #fff; text-shadow: 0 0 8px rgba(255,255,255,0.5); }
    .btn {
      background: linear-gradient(135deg, var(--color-x), var(--color-o));
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 240, 255, 0.3);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <h1>CYBER TIC-TAC-TOE</h1>
    <div class="scores">
      <div class="score-block" style="color: var(--color-x)">YOU (X) <span id="playerScore">0</span></div>
      <div class="score-block" style="color: #aaa">TIES <span id="tiesScore">0</span></div>
      <div class="score-block" style="color: var(--color-o)">CPU (O) <span id="cpuScore">0</span></div>
    </div>
    
    <div class="grid" id="grid">
      <div class="cell" data-index="0"></div>
      <div class="cell" data-index="1"></div>
      <div class="cell" data-index="2"></div>
      <div class="cell" data-index="3"></div>
      <div class="cell" data-index="4"></div>
      <div class="cell" data-index="5"></div>
      <div class="cell" data-index="6"></div>
      <div class="cell" data-index="7"></div>
      <div class="cell" data-index="8"></div>
    </div>

    <div class="status" id="status">Your Turn (X)</div>
    <button class="btn" id="resetBtn">RESET BOARD</button>
  </div>

  <script>
    const gridEl = document.getElementById('grid');
    const cells = document.querySelectorAll('.cell');
    const statusEl = document.getElementById('status');
    const resetBtn = document.getElementById('resetBtn');
    
    let board = Array(9).fill('');
    let isGameActive = true;
    let scores = { player: 0, cpu: 0, ties: 0 };

    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    function handleCellClick(e) {
      const index = e.target.getAttribute('data-index');
      if (board[index] !== '' || !isGameActive) return;

      makeMove(index, 'X');
      if (checkWin('X')) {
        endGame('X');
        return;
      }
      if (board.every(cell => cell !== '')) {
        endGame('Tie');
        return;
      }

      // CPU Turn
      isGameActive = false;
      statusEl.innerText = "CPU thinking...";
      setTimeout(cpuMove, 500);
    }

    function makeMove(index, player) {
      board[index] = player;
      cells[index].innerText = player;
      cells[index].classList.add(player.toLowerCase());
    }

    function cpuMove() {
      // Basic AI: Try to win, block player, or take center/random
      const bestMove = getBestMove();
      makeMove(bestMove, 'O');

      if (checkWin('O')) {
        endGame('O');
        return;
      }
      if (board.every(cell => cell !== '')) {
        endGame('Tie');
        return;
      }

      isGameActive = true;
      statusEl.innerText = "Your Turn (X)";
    }

    function getBestMove() {
      // 1. Check if AI can win
      for (let cond of winConditions) {
        let count = 0, emptyIdx = -1;
        for (let idx of cond) {
          if (board[idx] === 'O') count++;
          else if (board[idx] === '') emptyIdx = idx;
        }
        if (count === 2 && emptyIdx !== -1) return emptyIdx;
      }

      // 2. Check if player can be blocked
      for (let cond of winConditions) {
        let count = 0, emptyIdx = -1;
        for (let idx of cond) {
          if (board[idx] === 'X') count++;
          else if (board[idx] === '') emptyIdx = idx;
        }
        if (count === 2 && emptyIdx !== -1) return emptyIdx;
      }

      // 3. Take center if free
      if (board[4] === '') return 4;

      // 4. Random move
      const empties = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
      return empties[Math.floor(Math.random() * empties.length)];
    }

    function checkWin(player) {
      return winConditions.some(cond => cond.every(idx => board[idx] === player));
    }

    function endGame(winner) {
      isGameActive = false;
      if (winner === 'X') {
        statusEl.innerText = "You Win! 🎉";
        statusEl.classList.add('highlight');
        scores.player++;
        document.getElementById('playerScore').innerText = scores.player;
      } else if (winner === 'O') {
        statusEl.innerText = "CPU Wins! 🤖";
        statusEl.classList.add('highlight');
        scores.cpu++;
        document.getElementById('cpuScore').innerText = scores.cpu;
      } else {
        statusEl.innerText = "It's a Tie! 🤝";
        scores.ties++;
        document.getElementById('tiesScore').innerText = scores.ties;
      }
    }

    function resetBoard() {
      board = Array(9).fill('');
      isGameActive = true;
      statusEl.innerText = "Your Turn (X)";
      statusEl.classList.remove('highlight');
      cells.forEach(cell => {
        cell.innerText = '';
        cell.className = 'cell';
      });
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', resetBoard);
  </script>
</body>
</html>`,
};
