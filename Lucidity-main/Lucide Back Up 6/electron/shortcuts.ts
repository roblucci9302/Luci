import { globalShortcut, app } from "electron"
import { AppState } from "./main" // Adjust the import path if necessary

export class ShortcutsHelper {
  private appState: AppState

  constructor(appState: AppState) {
    this.appState = appState
  }

  public registerGlobalShortcuts(): void {
    globalShortcut.register("CommandOrControl+H", async () => {
      // Only trigger if window is visible to avoid conflicts with other apps
      if (!this.appState.isVisible()) return
      
      const mainWindow = this.appState.getMainWindow()
      if (mainWindow) {
        console.log("Taking screenshot...")
        try {
          const screenshotPath = await this.appState.takeScreenshot()
          const preview = await this.appState.getImagePreview(screenshotPath)
          mainWindow.webContents.send("screenshot-taken", {
            path: screenshotPath,
            preview
          })
        } catch (error) {
          console.error("Error capturing screenshot:", error)
        }
      }
    })

    globalShortcut.register("CommandOrControl+Enter", async () => {
      // Only trigger if window is visible to avoid conflicts with other apps
      if (!this.appState.isVisible()) return
      
      await this.appState.processingHelper.processScreenshots()
    })

    // Toggle the overlay on/off with Cmd/Ctrl + Shift + L.  This shortcut
    // mirrors the behaviour of the existing B shortcut but uses the
    // requested key combination.
    globalShortcut.register("CommandOrControl+Shift+L", () => {
      console.log("Command/Ctrl + Shift + L pressed. Toggling main window.")
      this.appState.toggleMainWindow()
      const mainWindow = this.appState.getMainWindow()
      // Ensure the window comes to the front on macOS when showing
      if (mainWindow && !this.appState.isVisible() && process.platform === "darwin") {
        mainWindow.setAlwaysOnTop(true, "normal")
        setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.setAlwaysOnTop(true, "floating")
          }
        }, 100)
      }
    })

    // Hide the current view and return to the queue when Esc is pressed.
    // This effectively closes the current response or solution view.
    globalShortcut.register("Escape", () => {
      // Only trigger if window is visible to avoid conflicts with other apps
      if (!this.appState.isVisible()) return
      
      console.log("Escape pressed. Closing solution/debug view and returning to queue.")
      // Cancel ongoing API requests
      this.appState.processingHelper.cancelOngoingRequests()
      // Clear both screenshot queues
      this.appState.clearQueues()
      // Reset view state
      this.appState.setView("queue")
      const mainWindow = this.appState.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("reset-view")
      }
    })

    globalShortcut.register("CommandOrControl+R", () => {
      // Only trigger if window is visible to avoid conflicts with other apps
      if (!this.appState.isVisible()) return
      
      console.log(
        "Command + R pressed. Canceling requests and resetting queues..."
      )

      // Cancel ongoing API requests
      this.appState.processingHelper.cancelOngoingRequests()

      // Clear both screenshot queues
      this.appState.clearQueues()

      console.log("Cleared queues.")

      // Update the view state to 'queue'
      this.appState.setView("queue")

      // Notify renderer process to switch view to 'queue'
      const mainWindow = this.appState.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("reset-view")
      }
    })

    // New shortcuts for moving the window
    globalShortcut.register("CommandOrControl+Left", () => {
      // Only trigger if window is visible to avoid conflicts with other apps
      if (!this.appState.isVisible()) return
      
      console.log("Command/Ctrl + Left pressed. Moving window left.")
      this.appState.moveWindowLeft()
    })

    globalShortcut.register("CommandOrControl+Right", () => {
      // Only trigger if window is visible to avoid conflicts with other apps
      if (!this.appState.isVisible()) return
      
      console.log("Command/Ctrl + Right pressed. Moving window right.")
      this.appState.moveWindowRight()
    })
    globalShortcut.register("CommandOrControl+Down", () => {
      // Only trigger if window is visible to avoid conflicts with other apps
      if (!this.appState.isVisible()) return
      
      console.log("Command/Ctrl + down pressed. Moving window down.")
      this.appState.moveWindowDown()
    })
    globalShortcut.register("CommandOrControl+Up", () => {
      // Only trigger if window is visible to avoid conflicts with other apps
      if (!this.appState.isVisible()) return
      
      console.log("Command/Ctrl + Up pressed. Moving window Up.")
      this.appState.moveWindowUp()
    })

    globalShortcut.register("CommandOrControl+B", () => {
      this.appState.toggleMainWindow()
      // If window exists and we're showing it, bring it to front
      const mainWindow = this.appState.getMainWindow()
      if (mainWindow && this.appState.isVisible()) {
        // Force the window to the front on macOS
        if (process.platform === "darwin") {
          mainWindow.setAlwaysOnTop(true, "normal")
          // Reset alwaysOnTop after a brief delay
          setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.setAlwaysOnTop(true, "floating")
            }
          }, 100)
        }
      }
    })

    // Unregister shortcuts when quitting
    app.on("will-quit", () => {
      globalShortcut.unregisterAll()
    })
  }
}
