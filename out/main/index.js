import { BrowserWindow, app, ipcMain, dialog } from "electron";
import * as path from "path";
import path__default from "path";
import * as fs from "fs";
const isDev = process.env.NODE_ENV === "development";
function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true
    }
  });
  const rendererUrl = isDev ? "http://localhost:5173" : `file://${path__default.join(app.getAppPath(), "dist/renderer/index.html")}`;
  window.loadURL(rendererUrl);
  if (isDev) {
    window.webContents.openDevTools();
  }
  return window;
}
function setupFileHandlers() {
  ipcMain.handle("file:save", async (event, { filename, data }) => {
    try {
      const result = await dialog.showSaveDialog({
        defaultPath: filename.replace(/\.excalidraw$/, "") + ".excalidraw",
        filters: [{ name: "Excalidraw Files", extensions: ["excalidraw"] }]
      });
      if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
        return { success: true, filePath: result.filePath };
      }
      return { success: false, error: "Save cancelled" };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
  ipcMain.handle("file:load", async (event, filePath) => {
    try {
      let fileToLoad = filePath;
      if (!fileToLoad) {
        const result = await dialog.showOpenDialog({
          filters: [{ name: "Excalidraw Files", extensions: ["excalidraw"] }],
          properties: ["openFile"]
        });
        if (result.canceled || result.filePaths.length === 0) {
          return { success: false, error: "Load cancelled" };
        }
        fileToLoad = result.filePaths[0];
      }
      const content = fs.readFileSync(fileToLoad, "utf-8");
      const data = JSON.parse(content);
      return { success: true, data, filePath: fileToLoad };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
  ipcMain.handle("file:saveThumbnail", async (event, { filePath, imageData }) => {
    try {
      const dir = path.dirname(filePath);
      const filename = path.basename(filePath, ".excalidraw");
      const thumbnailPath = path.join(dir, `${filename}.png`);
      const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(thumbnailPath, Buffer.from(base64Data, "base64"));
      return { success: true, thumbnailPath };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
  ipcMain.handle("file:browse", async (event, directory) => {
    try {
      const dir = directory || process.env.HOME || "/";
      const files = fs.readdirSync(dir, { withFileTypes: true });
      const result = files.filter((file) => file.name.endsWith(".excalidraw") || file.isDirectory()).map((file) => ({
        name: file.name,
        path: path.join(dir, file.name),
        isDirectory: file.isDirectory(),
        hasThumbnail: !file.isDirectory() && fs.existsSync(path.join(dir, file.name.replace(/\.excalidraw$/, ".png")))
      }));
      return { success: true, files: result, currentPath: dir };
    } catch (error) {
      return { success: false, error: String(error), files: [], currentPath: "" };
    }
  });
}
function setupIPC() {
  setupFileHandlers();
}
let mainWindow = null;
app.on("ready", () => {
  mainWindow = createWindow();
  setupIPC();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    mainWindow = createWindow();
  }
});
