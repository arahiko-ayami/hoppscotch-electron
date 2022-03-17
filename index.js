const { app, protocol, BrowserWindow, Notification } = require('electron')
const path = require('path');
const url = require('url');
let isFocused = true;

const createWindow = () => {
  const WEB_FOLDER = '/hoppscotch/packages/hoppscotch-app/dist';
  const PROTOCOL = 'file';

  protocol.interceptFileProtocol(PROTOCOL, (request, callback) => {
    //Strip protocol
    let url = request.url.substr(PROTOCOL.length + 1);

    // Build complete path for node require function
    url = path.join(__dirname, WEB_FOLDER, url);

    // Replace backslashes by forward slashes (windows)
    // url = url.replace(/\\/g, '/');
    url = path.normalize(url);

    callback({path: url});
  });

  const win = new BrowserWindow({
    width: 1024,
    height: 720,
    webPreferences: {
      nodeIntegrationInWorker: true
    }
  })

  win.removeMenu()

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
  }

  win.loadURL(url.format({
    pathname: 'index.html',
    protocol: PROTOCOL + ':',
    slashes: true
  }));
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
