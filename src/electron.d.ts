/**
 * Global type declarations for Electron IPC bridge.
 * Extends the Window interface with electronAPI methods
 * exposed via contextBridge in preload.ts.
 */

/** Possible update statuses sent from the main process via IPC */
type ElectronUpdateStatus = 'checking' | 'downloading' | 'not-available' | 'downloaded' | 'error' | null;

interface Window {
  electronAPI: {
    getEnv: () => Promise<string>;
    getAppVersion: () => Promise<string>;
    checkForUpdates: () => Promise<{ status: string; message?: string }>;
    installUpdate: () => Promise<void>;
    onUpdateStatus: (callback: (status: ElectronUpdateStatus, data?: unknown) => void) => () => void;
  };
}

