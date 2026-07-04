import { app, BrowserWindow, ipcMain } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const DEV_SERVER_URL = process.env.ELECTRON_DEV_SERVER_URL ?? "http://127.0.0.1:5173";
const PREVIEW_PORT = Number.parseInt(process.env.ELECTRON_PREVIEW_PORT ?? "4173", 10);
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}`;

let mainWindow: BrowserWindow | null = null;
let previewProcess: ChildProcess | null = null;

function appRoot(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "app");
  }
  return path.join(__dirname, "..");
}

function preloadPath(): string {
  return path.join(__dirname, "preload.cjs");
}

async function waitForUrl(url: string, timeoutMs = 60_000): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      await new Promise<void>((resolve, reject) => {
        const request = http.get(url, (response) => {
          response.resume();
          if (response.statusCode && response.statusCode >= 200 && response.statusCode < 500) {
            resolve();
            return;
          }
          reject(new Error(`Unexpected status ${response.statusCode ?? "unknown"}`));
        });
        request.on("error", reject);
        request.setTimeout(2_000, () => {
          request.destroy(new Error("timeout"));
        });
      });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function startPreviewServer(): Promise<string> {
  const root = appRoot();
  const viteBin =
    process.platform === "win32"
      ? path.join(root, "node_modules", "vite", "bin", "vite.js")
      : path.join(root, "node_modules", "vite", "bin", "vite.js");

  previewProcess = spawn(process.execPath, [viteBin, "preview", "--host", "127.0.0.1", "--port", String(PREVIEW_PORT), "--strictPort"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production", ELECTRON_RUN_AS_NODE: "1" },
  });

  previewProcess?.on("exit", () => {
    previewProcess = null;
  });

  await waitForUrl(PREVIEW_URL);
  return PREVIEW_URL;
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath(),
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  if (isDev) {
    await waitForUrl(DEV_SERVER_URL).catch(() => undefined);
    await mainWindow.loadURL(DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const previewUrl = await startPreviewServer();
    await mainWindow.loadURL(previewUrl);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "untitled";
}

ipcMain.handle("read-file", async (_event, filePath: string) => {
  return fs.readFileSync(filePath, "utf-8");
});

ipcMain.handle("write-file", async (_event, filePath: string, content: string) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
  return true;
});

ipcMain.handle("save-project", async (_event, projectData: { name?: string }) => {
  const projectsDir = path.join(app.getPath("documents"), "PNGtoHTMLapp Projects");
  fs.mkdirSync(projectsDir, { recursive: true });
  const filePath = path.join(projectsDir, `${sanitizeName(projectData.name ?? "untitled")}.json`);
  fs.writeFileSync(filePath, JSON.stringify(projectData, null, 2), "utf-8");
  return filePath;
});

ipcMain.handle("get-app-path", async (_event, name: Parameters<typeof app.getPath>[0]) => {
  return app.getPath(name);
});

app.whenReady().then(() => {
  void createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    previewProcess?.kill();
    app.quit();
  }
});

app.on("before-quit", () => {
  previewProcess?.kill();
});

app.on("activate", () => {
  if (mainWindow === null) {
    void createWindow();
  }
});