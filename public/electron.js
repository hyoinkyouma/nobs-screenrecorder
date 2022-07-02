const {
  app,
  BrowserWindow,
  desktopCapturer,
  Menu,
  ipcMain,
  dialog,
} = require("electron");
const { writeFile } = require("fs");
const isDev = require("electron-is-dev");

const path = require("path");
function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
    },
  });

  ipcMain.on("selectBuffer", async (e, buffer) => {
    console.log("video saving");

    const { filePath } = await dialog.showSaveDialog({
      buttonLabel: "Save video",
      defaultPath: `vid-${Date.now()}.mkv`,
    });
    if (filePath) {
      try {
        writeFile(filePath, buffer, () =>
          console.log("video saved successfully!")
        );
      } catch (e) {
        console.log(e.toString());
        console.log(buffer);
      }
    }
  });
  win.setMenu(null);
  ipcMain.on("selectSource", async () => {
    const inputSources = await desktopCapturer.getSources({
      types: ["window", "screen", "audio"],
    });
    const videoOptionsMenu = Menu.buildFromTemplate(
      inputSources.map((source) => {
        return {
          label: source.name,
          click: () => selectSource(source),
        };
      })
    );
    videoOptionsMenu.popup();
  });

  async function selectSource(source) {
    win.webContents.send("send-source", source);
  }

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
}

app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
