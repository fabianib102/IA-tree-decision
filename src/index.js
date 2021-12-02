/** importacion de todas las librerias necesarias para la aplicacion */
const { app, BrowserWindow } = require("electron");
const url = require("url");
const path = require("path");

require("electron-reload")(__dirname, {});

let mainWindow;

app.on("ready", () => {
  mainWindow = new BrowserWindow();
  mainWindow.maximize();
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "views/index.html"),
      protocol: "file",
      slashes: true,
    })
  );
});
