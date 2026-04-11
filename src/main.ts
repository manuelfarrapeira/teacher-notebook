import { app, BrowserWindow, ipcMain, autoUpdater, dialog } from 'electron';
import path from 'node:path';
import https from 'node:https';
import { spawn } from 'node:child_process';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

/** Minimum time (ms) the install loading GIF stays visible */
const INSTALL_SPLASH_MIN_MS = 5000;

/**
 * Handles Squirrel.Windows lifecycle events manually.
 * Adds a minimum delay on install so the loading splash is visible.
 * Returns true if a Squirrel event was handled (app will quit).
 */
function handleSquirrelEvents(): boolean {
  if (process.platform !== 'win32') return false;

  const squirrelCommand = process.argv[1];
  if (!squirrelCommand?.startsWith('--squirrel-')) return false;

  const appFolder = path.resolve(process.execPath, '..');
  const rootFolder = path.resolve(appFolder, '..');
  const updateExe = path.resolve(rootFolder, 'Update.exe');
  const exeName = path.basename(process.execPath);

  const spawnUpdate = (args: string[]) => {
    try {
      spawn(updateExe, args, { detached: true });
    } catch {
      // ignore
    }
  };

  switch (squirrelCommand) {
    case '--squirrel-install':
      spawnUpdate(['--createShortcut', exeName]);
      // Keep the process alive so Setup.exe shows the loading GIF longer
      setTimeout(() => app.quit(), INSTALL_SPLASH_MIN_MS);
      return true;

    case '--squirrel-updated':
      spawnUpdate(['--createShortcut', exeName]);
      setTimeout(() => app.quit(), 1500);
      return true;

    case '--squirrel-uninstall':
      spawnUpdate(['--removeShortcut', exeName]);
      setTimeout(() => app.quit(), 1500);
      return true;

    case '--squirrel-obsolete':
      app.quit();
      return true;

    default:
      return false;
  }
}

if (handleSquirrelEvents()) {
  // Squirrel event handled — prevent normal startup
  // (app.quit() is called after a delay inside the handler)
} else {

/**
 * After a fresh install, Squirrel launches the app with --squirrel-firstrun.
 * Instead of opening the main window, show a success dialog and quit.
 */
const isFirstRun = process.argv.includes('--squirrel-firstrun');
if (isFirstRun) {
  app.whenReady().then(() => {
    const installDir = path.resolve(process.execPath, '..', '..');

    const choice = dialog.showMessageBoxSync({
      type: 'info',
      buttons: ['Aceptar', 'Abrir aplicación'],
      defaultId: 1,
      title: 'Teacher Notebook',
      message: 'Teacher Notebook se ha instalado correctamente.',
      detail: `Ruta de instalación: ${installDir}\n\nPuede abrir la aplicación desde el acceso directo del escritorio o el menú de inicio.`,
      icon: path.join(__dirname, '../../public/favicon.png'),
    });

    if (choice === 1) {
      // Relaunch the app normally (without --squirrel-firstrun)
      app.relaunch({ args: [] });
    }
    app.quit();
  });
}

if (!isFirstRun) {

/** URL where RELEASES and .nupkg files are hosted on the NAS */
const UPDATE_FEED_URL = 'https://codefm.synology.me/teacher_notebook/';

/** Reference to the main window for IPC communication */
let mainWindow: BrowserWindow | null = null;

/** Whether an update has been downloaded and is ready to install */
let updateDownloaded = false;

/**
 * Configures the Squirrel.Windows auto-updater.
 * Only runs in packaged production builds (pro), not in dev or pre.
 */
const setupAutoUpdater = () => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    console.log('[AutoUpdater] Skipping — running in development mode');
    return;
  }

  const env = process.env.VITE_ENV || 'pre';
  if (env !== 'pro') {
    console.log('[AutoUpdater] Skipping — auto-update is only enabled for pro');
    return;
  }

  try {
    autoUpdater.setFeedURL({ url: UPDATE_FEED_URL });
    console.log(`[AutoUpdater] Feed URL set to: ${UPDATE_FEED_URL}`);
  } catch (err) {
    console.error('[AutoUpdater] Failed to set feed URL:', err);
    return;
  }

  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Checking for updates...');
    mainWindow?.webContents.send('update-status', 'checking');
  });

  autoUpdater.on('update-available', () => {
    console.log('[AutoUpdater] Update available — downloading...');
    mainWindow?.webContents.send('update-status', 'downloading');
  });

  autoUpdater.on('update-not-available', () => {
    console.log('[AutoUpdater] App is up to date.');
    mainWindow?.webContents.send('update-status', 'not-available');
  });

  autoUpdater.on('update-downloaded', (_event, releaseNotes, releaseName) => {
    console.log(`[AutoUpdater] Update downloaded: ${releaseName}`);
    updateDownloaded = true;
    mainWindow?.webContents.send('update-status', 'downloaded', {
      releaseName,
      releaseNotes,
    });
  });

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error:', err.message);
    mainWindow?.webContents.send('update-status', 'error', err.message);
  });

  // Check 10 seconds after start, then every 30 minutes
  setTimeout(async () => {
    try {
      const content = await fetchReleases();
      console.log(`[AutoUpdater] RELEASES pre-check OK: "${content}"`);
      autoUpdater.checkForUpdates();
    } catch (err) {
      console.error('[AutoUpdater] Initial check failed:', err instanceof Error ? err.message : err);
    }
  }, 10_000);

  setInterval(async () => {
    try {
      await fetchReleases();
      autoUpdater.checkForUpdates();
    } catch (err) {
      console.error('[AutoUpdater] Periodic check failed:', err instanceof Error ? err.message : err);
    }
  }, 30 * 60 * 1000);
}

const createWindow = () => {
  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, '../../public/favicon.ico')
    : path.join(__dirname, '../../public/favicon.png');

  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 500,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  if (process.env.VITE_ENV === 'local') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    setupAutoUpdater();
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// --- IPC Handlers ---

ipcMain.handle('get-env', () => {
  console.log('VITE_ENV:', process.env.VITE_ENV);
  return process.env.VITE_ENV || 'pre';
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

/**
 * Pre-checks that the RELEASES file is accessible via Node.js https.
 * Returns the content if OK, or throws with a descriptive error.
 */
const fetchReleases = (): Promise<string> => {
  const url = `${UPDATE_FEED_URL}RELEASES`;
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`RELEASES returned HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data.trim()));
    });
    req.on('error', (err) => reject(err));
    req.setTimeout(10_000, () => {
      req.destroy();
      reject(new Error('Timeout fetching RELEASES (10s)'));
    });
  });
}

/** Manually trigger an update check (pro only) with diagnostics */
ipcMain.handle('check-for-updates', async () => {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    return { status: 'dev-mode' };
  }
  const env = process.env.VITE_ENV || 'pre';
  if (env !== 'pro') {
    return { status: 'not-pro' };
  }

  // Step 1: pre-check RELEASES file accessibility
  try {
    const content = await fetchReleases();
    console.log(`[AutoUpdater] RELEASES content: "${content}"`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[AutoUpdater] Pre-check failed: ${msg}`);
    mainWindow?.webContents.send('update-status', 'error', msg);
    return { status: 'error', message: msg };
  }

  // Step 2: call Squirrel autoUpdater
  try {
    autoUpdater.checkForUpdates();
    return { status: 'checking' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    mainWindow?.webContents.send('update-status', 'error', msg);
    return { status: 'error', message: msg };
  }
});

/** Quit and install the downloaded update */
ipcMain.handle('install-update', () => {
  if (updateDownloaded) {
    autoUpdater.quitAndInstall();
  }
});

} // end if (!isFirstRun)

} // end else (normal startup, no Squirrel event)
