import type { PromptItem } from "./types";

export const kanbanBoardPrompt: PromptItem = {
  id: "kanban-board",
  title: "Flow Kanban Task Board",
  description:
    "A workspace tracker with drag-like button moves, dynamic task creation, and responsive layout.",
  category: "dashboards",
  prompt:
    'Create a responsive glassmorphic Kanban Board with columns for "To Do", "In Progress", and "Done". Users should be able to create tasks, delete them, and move them between lists.',
  mockCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flow Kanban</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #08080c;
      --card: rgba(255, 255, 255, 0.02);
      --border: rgba(255, 255, 255, 0.06);
      --todo: #00f0ff;
      --progress: #bd00ff;
      --done: #39ff14;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: #fff;
      font-family: 'Outfit', sans-serif;
      min-height: 100vh;
      background-image: radial-gradient(circle at 50% 50%, #151128 0%, var(--bg) 80%);
      padding: 40px 24px;
    }
    .wrapper {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .input-box {
      display: flex;
      gap: 8px;
    }
    input {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 16px;
      color: white;
      font-family: 'Outfit', sans-serif;
    }
    .btn {
      background: #bd00ff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    .board {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    .column {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      backdrop-filter: blur(10px);
    }
    .col-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .col-indicator {
      width: 8px; height: 8px; border-radius: 50%;
    }
    .task-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 200px;
    }
    .task-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .task-card:hover {
      border-color: rgba(255,255,255,0.15);
    }
    .task-desc { font-size: 14px; color: #ddd; }
    .task-actions {
      display: flex;
      justify-content: flex-end;
      gap: 6px;
    }
    .action-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      color: white;
      padding: 4px 8px;
      font-size: 11px;
      border-radius: 4px;
      cursor: pointer;
    }
    .action-btn.delete { color: #ff5555; }
  </style>
</head>
<body>
  <div class="wrapper">
    <header>
      <h1>FLOW KANBAN</h1>
      <div class="input-box">
        <input type="text" id="taskInput" placeholder="Enter task details...">
        <button class="btn" id="addBtn">ADD TASK</button>
      </div>
    </header>

    <div class="board">
      <div class="column" id="col-todo">
        <div class="col-header" style="color: var(--todo)">
          <span>To Do</span>
          <div class="col-indicator" style="background: var(--todo)"></div>
        </div>
        <div class="task-list" id="todo-list"></div>
      </div>
      <div class="column" id="col-progress">
        <div class="col-header" style="color: var(--progress)">
          <span>In Progress</span>
          <div class="col-indicator" style="background: var(--progress)"></div>
        </div>
        <div class="task-list" id="progress-list"></div>
      </div>
      <div class="column" id="col-done">
        <div class="col-header" style="color: var(--done)">
          <span>Done</span>
          <div class="col-indicator" style="background: var(--done)"></div>
        </div>
        <div class="task-list" id="done-list"></div>
      </div>
    </div>
  </div>

  <script>
    const addBtn = document.getElementById('addBtn');
    const taskInput = document.getElementById('taskInput');
    
    let tasks = [
      { id: 1, text: 'Design branding concepts', status: 'todo' },
      { id: 2, text: 'Configure local project environment', status: 'progress' },
      { id: 3, text: 'Refine layout components', status: 'done' }
    ];

    function renderTasks() {
      const todoList = document.getElementById('todo-list');
      const progressList = document.getElementById('progress-list');
      const doneList = document.getElementById('done-list');
      
      todoList.innerHTML = '';
      progressList.innerHTML = '';
      doneList.innerHTML = '';

      tasks.forEach(task => {
        const card = document.createElement('div');
        card.classList.add('task-card');
        
        let moveBtnHtml = '';
        if (task.status === 'todo') {
          moveBtnHtml = '<button class="action-btn" onclick="moveTask(' + task.id + ', \\'progress\\')">▶</button>';
        } else if (task.status === 'progress') {
          moveBtnHtml = '<button class="action-btn" onclick="moveTask(' + task.id + ', \\'todo\\')">◀</button>' +
                        '<button class="action-btn" onclick="moveTask(' + task.id + ', \\'done\\')">▶</button>';
        } else if (task.status === 'done') {
          moveBtnHtml = '<button class="action-btn" onclick="moveTask(' + task.id + ', \\'progress\\')">◀</button>';
        }

        card.innerHTML = \`
          <p class="task-desc">\${task.text}</p>
          <div class="task-actions">
            <button class="action-btn delete" onclick="deleteTask(\${task.id})">✕</button>
            \${moveBtnHtml}
          </div>
        \`;

        if (task.status === 'todo') todoList.appendChild(card);
        if (task.status === 'progress') progressList.appendChild(card);
        if (task.status === 'done') doneList.appendChild(card);
      });
    }

    window.moveTask = function(id, nextStatus) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.status = nextStatus;
        renderTasks();
      }
    };

    window.deleteTask = function(id) {
      tasks = tasks.filter(t => t.id !== id);
      renderTasks();
    };

    addBtn.addEventListener('click', () => {
      const text = taskInput.value.trim();
      if (text !== '') {
        tasks.push({
          id: Date.now(),
          text: text,
          status: 'todo'
        });
        taskInput.value = '';
        renderTasks();
      }
    });

    renderTasks();
  </script>
</body>
</html>`,
};
