import type { PromptItem } from './types';

export const pomodoroTimerPrompt: PromptItem = {
    id: 'pomodoro-timer',
    title: 'Circular Pomodoro Hub',
    description: 'Sleek dark glassmorphism layout with custom session intervals, circular SVG countdown, and audio alerts.',
    category: 'tools',
    prompt: 'Design a glassmorphic circular Pomodoro countdown timer with modern settings, adjustable work/break lengths, sound alerts, and a history log of completed sessions.',
    mockCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minimal Pomodoro</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #09090b;
      --accent: #ff007f;
      --card: rgba(255, 255, 255, 0.03);
      --border: rgba(255, 255, 255, 0.08);
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
      background-image: radial-gradient(circle at 50% 50%, #20132c 0%, var(--bg) 80%);
    }
    .timer-card {
      background: var(--card);
      border: 1px solid var(--border);
      backdrop-filter: blur(15px);
      border-radius: 24px;
      padding: 32px;
      width: 90%;
      max-width: 360px;
      box-shadow: 0 30px 60px rgba(0,0,0,0.6);
      text-align: center;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 20px;
      letter-spacing: 1px;
      background: linear-gradient(135deg, #ff007f, #bd00ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .progress-box {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 0 auto 24px;
    }
    .progress-circle {
      transform: rotate(-90deg);
      width: 100%;
      height: 100%;
    }
    .progress-circle circle {
      fill: none;
      stroke-width: 8;
    }
    .circle-bg { stroke: rgba(255,255,255,0.03); }
    .circle-progress {
      stroke: var(--accent);
      stroke-linecap: round;
      transition: stroke-dashoffset 0.3s;
      filter: drop-shadow(0 0 6px var(--accent));
    }
    .time-display {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Share Tech Mono', monospace;
      font-size: 36px;
      font-weight: 600;
      color: #fff;
    }
    .controls {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      color: white;
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn.primary {
      background: var(--accent);
      border-color: var(--accent);
      box-shadow: 0 0 10px rgba(255,0,127,0.3);
    }
    .btn:hover {
      transform: translateY(-1px);
      background: rgba(255,255,255,0.1);
    }
    .btn.primary:hover {
      background: #ff2a93;
    }
    .settings {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid var(--border);
      padding-top: 16px;
      font-size: 13px;
      color: #888;
    }
    .setting-block input {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      color: white;
      width: 45px;
      padding: 4px;
      border-radius: 4px;
      text-align: center;
      margin-left: 4px;
    }
  </style>
</head>
<body>
  <div class="timer-card">
    <h1>POMODORO SPACE</h1>
    <div class="progress-box">
      <svg class="progress-circle" viewBox="0 0 100 100">
        <circle class="circle-bg" cx="50" cy="50" r="45"></circle>
        <circle class="circle-progress" cx="50" cy="50" r="45" stroke-dasharray="282.7" stroke-dashoffset="0"></circle>
      </svg>
      <div class="time-display" id="timerText">25:00</div>
    </div>
    
    <div class="controls">
      <button class="btn primary" id="playBtn">START</button>
      <button class="btn" id="resetBtn">RESET</button>
    </div>

    <div class="settings">
      <div class="setting-block">
        Work: <input type="number" id="workTime" value="25" min="1">
      </div>
      <div class="setting-block">
        Break: <input type="number" id="breakTime" value="5" min="1">
      </div>
    </div>
  </div>

  <script>
    const playBtn = document.getElementById('playBtn');
    const resetBtn = document.getElementById('resetBtn');
    const timerText = document.getElementById('timerText');
    const workInput = document.getElementById('workTime');
    const breakInput = document.getElementById('breakTime');
    const circleProgress = document.querySelector('.circle-progress');

    let totalSeconds = 25 * 60;
    let secondsLeft = totalSeconds;
    let timerId = null;
    let isWorking = true;
    const perimeter = 282.7;

    function updateCircle(offset) {
      circleProgress.style.strokeDashoffset = offset;
    }

    function displayTime() {
      const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
      const seconds = (secondsLeft % 60).toString().padStart(2, '0');
      timerText.innerText = \`\${minutes}:\${seconds}\`;
    }

    function toggleTimer() {
      if (timerId) {
        // Pause
        clearInterval(timerId);
        timerId = null;
        playBtn.innerText = "START";
      } else {
        // Start
        timerId = setInterval(tick, 1000);
        playBtn.innerText = "PAUSE";
      }
    }

    function tick() {
      if (secondsLeft <= 0) {
        // Alert Sound Simulation
        alert(isWorking ? "Time for a break! ☕" : "Back to work! 💪");
        isWorking = !isWorking;
        document.documentElement.style.setProperty('--accent', isWorking ? '#ff007f' : '#00f0ff');
        secondsLeft = (isWorking ? workInput.value : breakInput.value) * 60;
        totalSeconds = secondsLeft;
      } else {
        secondsLeft--;
      }
      
      const progress = secondsLeft / totalSeconds;
      const offset = perimeter * (1 - progress);
      updateCircle(offset);
      displayTime();
    }

    function resetTimer() {
      clearInterval(timerId);
      timerId = null;
      isWorking = true;
      document.documentElement.style.setProperty('--accent', '#ff007f');
      secondsLeft = workInput.value * 60;
      totalSeconds = secondsLeft;
      updateCircle(0);
      displayTime();
      playBtn.innerText = "START";
    }

    workInput.addEventListener('change', resetTimer);
    breakInput.addEventListener('change', resetTimer);
    playBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Initial setup
    displayTime();
  </script>
</body>
</html>`
};
