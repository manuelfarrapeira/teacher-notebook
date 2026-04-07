import { contextBridge, ipcRenderer } from 'electron';

/** Local type alias matching ElectronUpdateStatus from electron.d.ts */
type UpdateStatus = 'checking' | 'downloading' | 'not-available' | 'downloaded' | 'error' | null;


contextBridge.exposeInMainWorld('electronAPI', {
  getEnv: () => ipcRenderer.invoke('get-env'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateStatus: (callback: (status: UpdateStatus, data?: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, status: UpdateStatus, data?: unknown) => {
      callback(status, data);
    };
    ipcRenderer.on('update-status', handler);
    return () => {
      ipcRenderer.removeListener('update-status', handler);
    };
  },
});
