# 🎬 B-Roll Scout — GitHub Actions Build Guide

**AI-powered B-Roll research tool for video editors.**  
Paste your script → get optimized stock search prompts → search Pexels + Pixabay → organize your collection → find what's missing.

---

## Features

| Tab | What it does |
|-----|-------------|
| **Script Analyzer** | Paste your script, AI generates optimized search prompts line-by-line |
| **Stock Search** | Search Pexels + Pixabay simultaneously in one grid |
| **Organizer** | Tag and manage your saved footage collection |
| **Gap Analyzer** | AI compares your script vs collection — tells you exactly what's missing |

---

## Setup (5 minutes, all free)

### 1. Install Node.js
Download from **https://nodejs.org** (LTS version)

### 2. Install the app
```bash
cd broll-scout
npm install
```

### 3. Run it
```bash
npm start
```

On first launch, you'll be asked for 3 free API keys:

### Free API Keys (all take < 60 seconds)

| Key | Where to get it | Cost |
|-----|----------------|------|
| **Groq** | https://console.groq.com | Free |
| **Pexels** | https://www.pexels.com/api/ | Free |
| **Pixabay** | https://pixabay.com/api/docs/ | Free |

The app has "Get free key →" buttons that open each page directly.

---

## Build a distributable app

### Mac (.dmg)
```bash
npm run build:mac
```

### Windows (.exe installer)
```bash
npm run build:win
```

### Both
```bash
npm run build:all
```

Built files appear in the `dist/` folder. Share the `.dmg` (Mac) or `.exe` (Windows) with anyone.

---

## Workflow

```
1. Paste script → Script Analyzer → hit ANALYZE
2. Get AI-generated search prompts for every scene
3. Click "Pexels" or "Pixabay" on any prompt → jumps to Stock Search
4. Save footage you like → goes to Organizer
5. Tag it (Hero Shot, B-Roll, Cutaway, etc.)
6. Run Gap Analyzer → see exactly what you're still missing
7. Repeat until fully covered
```

---

## Tech Stack
- **Electron** — cross-platform desktop app
- **Groq** — free, fast AI (Llama 3)  
- **Pexels API** — free video search
- **Pixabay API** — free video search
- No backend, no accounts, no subscription — everything runs locally

---

*Built for video editors who are tired of switching between 5 tabs.*
