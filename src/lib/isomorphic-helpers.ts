/**
 * Helpers for isomorphic rendering (works in both browser and server)
 */

// Check if we're running in the browser
export const isBrowser = typeof window !== 'undefined';

// Safe access to window object
export const getWindow = () => {
  return isBrowser ? window : undefined;
};

// Safe access to document object
export const getDocument = () => {
  return isBrowser ? document : undefined;
};

// Safe access to localStorage
export const getLocalStorage = () => {
  if (isBrowser) {
    try {
      return window.localStorage;
    } catch (e) {
      console.warn('localStorage is not available:', e);
      return null;
    }
  }
  return null;
};

// Safe access to sessionStorage
export const getSessionStorage = () => {
  if (isBrowser) {
    try {
      return window.sessionStorage;
    } catch (e) {
      console.warn('sessionStorage is not available:', e);
      return null;
    }
  }
  return null;
};

// Safe localStorage getItem
export const getStorageItem = (key: string): string | null => {
  const storage = getLocalStorage();
  if (storage) {
    try {
      return storage.getItem(key);
    } catch (e) {
      console.warn(`Error getting item ${key} from localStorage:`, e);
    }
  }
  return null;
};

// Safe localStorage setItem
export const setStorageItem = (key: string, value: string): boolean => {
  const storage = getLocalStorage();
  if (storage) {
    try {
      storage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn(`Error setting item ${key} in localStorage:`, e);
    }
  }
  return false;
};

// Get current URL (works in both browser and server)
export const getCurrentUrl = (serverUrl?: string): string => {
  if (isBrowser) {
    return window.location.href;
  }
  return serverUrl || '';
};

// Get current path (works in both browser and server)
export const getCurrentPath = (serverPath?: string): string => {
  if (isBrowser) {
    return window.location.pathname;
  }
  return serverPath || '';
};