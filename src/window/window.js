'use strict';

const { app, BrowserWindow } = require('electron');

/**
 * A mapping of window key (which is our own construct) to a window ID (which is
 * assigned by electron).
 * @type Object<string, number>
 */
const windowMapping = {};

/**
 * Open a given window; if it is already open, focus it.
 * @param {string} name The window identifier; this controls window re-use.
 * @param {string} url The URL to load into the window.
 * @param {Boolean} restoreMinimizedWindow If it's minimized, restore it.
 *    This is for when the user tries to run a second instance, and that instance
 *    focuses this one and shuts itself down.
 * @param {Electron.WebPreferences} prefs Options to control the new window.
 */
function createWindow(name, url, restoreMinimizedWindow, prefs, restoreWindow=false) {
  let window = (name in windowMapping) ? BrowserWindow.fromId(windowMapping[name]) : null;

  if (window) {
    if (!window.isFocused()) {
      if (restoreMinimizedWindow && window.isMinimized()) {
        window.restore();
      }
      window.show();
    }

    return;
  }

  window = new BrowserWindow({
    width: 940, height: 600, webPreferences: prefs
  });
  window.loadURL(url);
  windowMapping[name] = window.id;
}

/**
 * Open the preferences window; if it is already open, focus it.
 * @param {boolean} restoreMinimizedWindow Whether to unminimize a minimized window.
 */
function openPreferences(restoreMinimizedWindow) {
  let url = 'app://./index.html';

  if (/^dev/i.test(process.env.NODE_ENV)) {
    url = 'http://localhost:8888/';
  }
  createWindow('preferences', url, restoreMinimizedWindow, { nodeIntegration: true });
}

/**
 * Send a message to all windows in the renderer process.
 * @param {string} channel The channel to send on.
 * @param  {...any} args Any arguments to pass.
 */
function send(channel, ...args) {
  for (const windowId of Object.values(windowMapping)) {
    const window = BrowserWindow.fromId(windowId);

    window?.webContents?.send(channel, ...args);
  }
}

module.exports = { openPreferences, send };
