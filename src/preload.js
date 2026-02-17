const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getSettings:    ()         => ipcRenderer.invoke('get-settings'),
  saveSettings:   (s)        => ipcRenderer.invoke('save-settings', s),
  getCollection:  ()         => ipcRenderer.invoke('get-collection'),
  saveCollection: (c)        => ipcRenderer.invoke('save-collection', c),
  openUrl:        (url)      => ipcRenderer.invoke('open-url', url),
  groq:           (opts)     => ipcRenderer.invoke('groq-request', opts),
  pexels:         (opts)     => ipcRenderer.invoke('pexels-search', opts),
  pixabay:        (opts)     => ipcRenderer.invoke('pixabay-search', opts),
  platform: process.platform
});
