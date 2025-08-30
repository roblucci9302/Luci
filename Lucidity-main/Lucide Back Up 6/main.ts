// en haut du fichier
import * as path from 'path'
import { app, BrowserWindow } from 'electron'

// dans ta fonction createWindow()
const win = new BrowserWindow({
  width: 900,
  height: 700,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js') // adapte si besoin
  }
})

const DEV_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173/'
if (!app.isPackaged) {
  win.loadURL(DEV_URL)
} else {
  // en prod, charge le fichier buildé
  // adapte le chemin selon ton build renderer
  win.loadFile(path.join(__dirname, '../renderer/index.html'))
}

