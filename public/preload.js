const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectSource: () => {
    ipcRenderer.send("selectSource");
  },
  sendSource: (source, cb) => {
    ipcRenderer.on("send-source", source, cb);
  },
  selectBuffer: (buffer) => {
    ipcRenderer.send("selectBuffer", buffer);
  },
});
