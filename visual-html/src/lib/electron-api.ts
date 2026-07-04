import type { ElectronAPI, ElectronAppPath, ElectronProjectPayload } from "@/types/electron";

export function isElectronDesktop(): boolean {
  return typeof window !== "undefined" && Boolean(window.electronAPI);
}

export function getElectronAPI(): ElectronAPI | null {
  if (!isElectronDesktop()) return null;
  return window.electronAPI ?? null;
}

export async function saveElectronProject(
  projectData: ElectronProjectPayload,
): Promise<string | null> {
  const api = getElectronAPI();
  if (!api) return null;
  return api.saveProject(projectData);
}

export async function readElectronFile(filePath: string): Promise<string | null> {
  const api = getElectronAPI();
  if (!api) return null;
  return api.readFile(filePath);
}

export async function writeElectronFile(
  filePath: string,
  content: string,
): Promise<boolean | null> {
  const api = getElectronAPI();
  if (!api) return null;
  return api.writeFile(filePath, content);
}

export async function getElectronAppPath(name: ElectronAppPath): Promise<string | null> {
  const api = getElectronAPI();
  if (!api) return null;
  return api.getAppPath(name);
}
