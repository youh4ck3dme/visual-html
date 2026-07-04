export type ElectronAppPath =
  | "home"
  | "appData"
  | "userData"
  | "sessionData"
  | "temp"
  | "exe"
  | "module"
  | "desktop"
  | "documents"
  | "downloads"
  | "music"
  | "pictures"
  | "videos"
  | "recent"
  | "logs"
  | "crashDumps";

export type ElectronProjectPayload = {
  name?: string;
  [key: string]: unknown;
};

export type ElectronAPI = {
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<boolean>;
  saveProject: (projectData: ElectronProjectPayload) => Promise<string>;
  getAppPath: (name: ElectronAppPath) => Promise<string>;
};

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
