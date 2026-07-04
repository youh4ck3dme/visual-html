import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  readFile: (filePath: string) => ipcRenderer.invoke("read-file", filePath),
  writeFile: (filePath: string, content: string) => ipcRenderer.invoke("write-file", filePath, content),
  saveProject: (projectData: unknown) => ipcRenderer.invoke("save-project", projectData),
  getAppPath: (name: string) => ipcRenderer.invoke("get-app-path", name),
});