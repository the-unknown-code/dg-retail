import { app, shell, BrowserWindow, ipcMain, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { init, syncData } from './sheets-sync'
import fs from 'fs'
import path from 'path'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    show: false,
    fullscreen: true,
    frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  // update
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "script-src 'self' 'unsafe-eval' blob:; worker-src 'self' blob:;"
        ]
      }
    })
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('init-machine', async (_, machineId) => {
    init(machineId)
    await syncData() // sync immediately on startup
  })

  ipcMain.handle('sync-data', async () => {
    await syncData()
  })

  ipcMain.handle('append-json', (_event, entry: object) => {
    const filePath = app.isPackaged
      ? path.join(path.dirname(app.getPath('exe')), 'data.json')
      : path.join(process.cwd(), 'data.json')

    let existing: object[] = []

    try {
      const raw = fs.readFileSync(filePath, 'utf-8').trim()
      existing = JSON.parse(raw)
    } catch {
      // file doesn't exist yet or is empty — start fresh
      existing = []
    }

    existing.push(entry)
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8')
    console.log('Appended entry, total:', existing.length)
    return existing.length
  })

  // Read machine_id.txt from app root
  ipcMain.handle('get-machine-id', () => {
    const srcPath = app.isPackaged
      ? path.join(path.dirname(app.getPath('exe')), 'machine_id.txt')
      : path.join(process.cwd(), 'machine_id.txt')

    try {
      return fs.readFileSync(srcPath, 'utf-8').trim()
    } catch {
      console.error('machine_id.txt not found at:', srcPath)
      return null
    }
  })

  ipcMain.handle('get-config', () => {
    const configPath = app.isPackaged
      ? path.join(path.dirname(app.getPath('exe')), 'config.json')
      : path.join(process.cwd(), 'config.json')

    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    } catch {
      console.error('config.json not found at:', configPath)
      return null
    }
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
