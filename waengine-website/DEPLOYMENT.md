# 🚀 WAEngine Website - Vercel Deployment Guide

## Schnelle Deployment-Anleitung

### 1. Vorbereitung
```bash
# In den Website-Ordner wechseln
cd waengine-website

# Dependencies installieren
npm install

# Local testen
npm run dev
# → http://localhost:3000
```

### 2. Vercel Account erstellen
1. Gehe zu [vercel.com](https://vercel.com)
2. "Sign up" mit GitHub Account
3. Vercel Zugriff auf dein Repository gewähren

### 3. Projekt deployen

#### Option A: Vercel Dashboard
1. **"New Project"** klicken
2. **GitHub Repository** auswählen
3. **Root Directory:** `waengine-website` setzen
4. **Framework:** Next.js (automatisch erkannt)
5. **Deploy** klicken

#### Option B: Vercel CLI
```bash
# Vercel CLI installieren
npm i -g vercel

# In Website-Ordner
cd waengine-website

# Deployment starten
vercel

# Fragen beantworten:
# ? Set up and deploy "waengine-website"? [Y/n] Y
# ? Which scope? [Dein Account]
# ? Link to existing project? [N/y] N
# ? What's your project's name? waengine-website
# ? In which directory is your code located? ./
```

### 4. Automatische Deployments

Nach dem ersten Deployment:
- **Jeder Push** zu `main` branch → Automatisches Deployment
- **Pull Requests** → Preview Deployments
- **Rollbacks** → Einfach über Vercel Dashboard

### 5. Custom Domain (Optional)

1. **Domain kaufen** (z.B. bei Namecheap, GoDaddy)
2. **Vercel Dashboard** → Projekt → Settings → Domains
3. **Domain hinzufügen:** `waengine.dev` oder `waengine.io`
4. **DNS konfigurieren:** CNAME auf `cname.vercel-dns.com`

### 6. Performance Optimierung

Die Website ist bereits optimiert:
- ✅ **Next.js SSR** - Server-Side Rendering
- ✅ **Image Optimization** - Automatische Bildkomprimierung
- ✅ **Code Splitting** - Lazy Loading
- ✅ **Caching** - NPM API Cache (5 Min)
- ✅ **CDN** - Vercel Edge Network

### 7. Monitoring

**Vercel Analytics:**
1. Dashboard → Projekt → Analytics
2. **Core Web Vitals** überwachen
3. **Performance Scores** checken

**NPM API Status:**
- API läuft automatisch alle 5 Minuten
- Fallback bei API-Fehlern
- Fehler werden in Vercel Functions Logs angezeigt

### 8. Updates deployen

```bash
# Änderungen machen
# Dateien bearbeiten...

# Git commit & push
git add .
git commit -m "Update website"
git push origin main

# → Automatisches Deployment auf Vercel
```

### 9. Troubleshooting

**Build Fehler:**
```bash
# Local build testen
npm run build

# Fehler in Vercel Dashboard → Functions → Logs
```

**API Fehler:**
- NPM API manchmal langsam
- Fallback-Daten werden automatisch verwendet
- Cache reduziert API-Calls

**Performance Issues:**
- Lighthouse Score in Chrome DevTools checken
- Vercel Analytics für Real User Metrics
- Images optimieren falls nötig

### 10. Kosten

**Vercel Free Tier:**
- ✅ Unlimited Static Sites
- ✅ 100GB Bandwidth/Monat
- ✅ Serverless Functions
- ✅ Custom Domains
- ✅ SSL Certificates

**Upgrade nur nötig bei:**
- > 100GB Traffic/Monat
- > 100 Serverless Function Executions/Tag
- Team-Features

---

## 🎯 Finale URL

Nach erfolgreichem Deployment:
- **Vercel URL:** `https://waengine-website-[hash].vercel.app`
- **Custom Domain:** `https://waengine.dev` (falls konfiguriert)

## 📊 Live Features

- 📈 **Echte NPM Download-Zahlen**
- 🔄 **Auto-Updates alle 5 Minuten**
- 📱 **Responsive auf allen Geräten**
- ⚡ **Blitzschnelle Performance**
- 🎨 **Moderne UI mit Glassmorphism**

**🚀 Deine WAEngine Website ist jetzt live!**