const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

const storePath = path.join(app.getPath('userData'), 'brollscout-settings.json');

function loadStore() {
  try {
    if (fs.existsSync(storePath)) return JSON.parse(fs.readFileSync(storePath, 'utf8'));
  } catch (e) {}
  return {};
}

function saveStore(data) {
  try { fs.writeFileSync(storePath, JSON.stringify(data, null, 2)); } catch (e) {}
}

let store = loadStore();

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    backgroundColor: '#080808',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  win.once('ready-to-show', () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Settings
ipcMain.handle('get-settings', () => store);
ipcMain.handle('save-settings', (_, settings) => {
  store = { ...store, ...settings };
  saveStore(store);
  return true;
});

// Collection persistence
ipcMain.handle('get-collection', () => store.collection || []);
ipcMain.handle('save-collection', (_, collection) => {
  store.collection = collection;
  saveStore(store);
  return true;
});

// Open external URLs
ipcMain.handle('open-url', (_, url) => shell.openExternal(url));

// Read file contents (for PDF/DOCX drag & drop)
ipcMain.handle('read-file', async (_, filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.txt' || ext === '.md') {
      return { type: 'text', content: fs.readFileSync(filePath, 'utf8') };
    }
    // For PDF and DOCX, return base64 so renderer can process
    const buffer = fs.readFileSync(filePath);
    return { type: ext.replace('.',''), content: buffer.toString('base64') };
  } catch (e) {
    throw new Error('Could not read file: ' + e.message);
  }
});

// Download video file through main process
ipcMain.handle('download-video', async (_, { url, filename }) => {
  return new Promise((resolve, reject) => {
    const downloadsPath = app.getPath('downloads');
    const filePath = path.join(downloadsPath, filename);
    const file = fs.createWriteStream(filePath);

    const request = (urlStr) => {
      const urlObj = new URL(urlStr);
      const isHttps = urlObj.protocol === 'https:';
      const lib = isHttps ? require('https') : require('http');
      lib.get(urlStr, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          request(res.headers.location);
          return;
        }
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(filePath); });
      }).on('error', (err) => { fs.unlink(filePath, () => {}); reject(err); });
    };
    request(url);
  });
});

// Groq API call (proxied through main process to avoid CORS)
ipcMain.handle('groq-request', async (_, { apiKey, messages, model }) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 2048
    });

    const options = {
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message));
          else resolve(parsed);
        } catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
});

// Pexels search
ipcMain.handle('pexels-search', async (_, { apiKey, query }) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.pexels.com',
      path: `/videos/search?query=${encodeURIComponent(query)}&per_page=12&size=medium`,
      method: 'GET',
      headers: { 'Authorization': apiKey }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
});

// Pixabay search
ipcMain.handle('pixabay-search', async (_, { apiKey, query }) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'pixabay.com',
      path: `/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=12`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
