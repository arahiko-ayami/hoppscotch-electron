const { app, BrowserWindow, Notification } = require('electron')
const path = require('path');
const express = require('express');
let port = 3000;
const server = express();
let isFocused = true;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 720,
    webPreferences: {
      nodeIntegrationInWorker: true
    }
  })

  win.on('blur', () => {
    isFocused = false;
  })

  win.on('focus', () => {
    isFocused = true;
  })

  win.webContents.on('did-finish-load', () => {
    if(!isFocused)
      showNotification('Hoppscotch Electron', 'Hoppscotch is running')
  })

  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // Someone tried to run a second instance, we should focus our window.
      if (win) {
        if (win.isMinimized()) win.restore()
        win.focus()
      }
    })

    server.use(express.static(__dirname + '/hoppscotch/packages/hoppscotch-app/dist'));
    server.get('*', function (request, response) {
      response.sendFile(path.resolve(__dirname, 'index.html'));
    });

    server.listen(port);
  }

  win.loadURL(`http://localhost:${port}`)
}

function showNotification (title, body) {
  new Notification({ title, body}).show()
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
