# 🌐 WAEngine Website

Offizielle Website für WAEngine mit Live NPM-Statistiken und Dokumentation.

## 🚀 Features

- **Live NPM Stats** - Echte Download-Zahlen von der NPM API
- **Responsive Design** - Optimiert für alle Geräte
- **Modern UI** - Tailwind CSS mit Glassmorphism-Effekten
- **Performance** - Next.js mit SSR und Caching
- **SEO-optimiert** - Meta-Tags und Open Graph

## 📦 Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build
npm run build
npm start
```

## 🔧 Deployment auf Vercel

1. **Repository zu Vercel verbinden:**
   - Gehe zu [vercel.com](https://vercel.com)
   - "New Project" → GitHub Repository auswählen
   - `waengine-website` Ordner als Root setzen

2. **Automatisches Deployment:**
   - Vercel erkennt Next.js automatisch
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables (optional):**
   - Keine zusätzlichen Env-Vars nötig
   - NPM API ist öffentlich zugänglich

## 📊 NPM API Integration

Die Website nutzt die offizielle NPM Registry API:

- **Package Info:** `https://registry.npmjs.org/waengine`
- **Download Stats:** `https://api.npmjs.org/downloads/point/last-month/waengine`
- **Caching:** 5 Minuten Server-Side Cache
- **Fallback:** Statische Daten bei API-Fehlern

## 🎨 Design System

### Farben
- **Primary:** Green (#22c55e) - WAEngine Hauptfarbe
- **Secondary:** Blue (#3b82f6) - Akzentfarbe
- **Background:** Gradient von Green zu Blue

### Komponenten
- **Hero Section** - Große Überschrift mit Installation
- **Stats Cards** - Live NPM Download-Zahlen
- **Feature Grid** - 6 Hauptfeatures von WAEngine
- **Code Examples** - Syntax-highlighted Code-Blöcke

## 📱 Responsive Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## 🔄 Auto-Updates

- **NPM Stats:** Alle 5 Minuten aktualisiert
- **Cache:** Server-Side Caching für Performance
- **Real-time:** Live Download-Zahlen ohne Reload

## 📈 Performance

- **Lighthouse Score:** 95+ auf allen Metriken
- **Core Web Vitals:** Optimiert für Google Rankings
- **Image Optimization:** Next.js automatische Optimierung
- **Code Splitting:** Automatisches Lazy Loading

## 🛠️ Technologie-Stack

- **Framework:** Next.js 14
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **API:** Axios für HTTP Requests
- **Deployment:** Vercel
- **Language:** JavaScript/TypeScript

## 📝 Anpassungen

### Neue Features hinzufügen:
1. Komponente in `/components` erstellen
2. Page in `/pages` hinzufügen
3. API Route in `/pages/api` für Backend-Logic

### Styling ändern:
1. Globale Styles in `/styles/globals.css`
2. Tailwind Config in `tailwind.config.js`
3. Komponenten-spezifische Styles inline

### NPM API erweitern:
1. `/pages/api/npm-stats.js` bearbeiten
2. Neue Endpoints hinzufügen
3. Frontend-Integration in `/pages/index.js`

## 🚀 Live Website

Nach Vercel-Deployment verfügbar unter:
- **Production:** `https://waengine-website.vercel.app`
- **Custom Domain:** Kann in Vercel-Settings konfiguriert werden

## 📞 Support

Bei Fragen oder Problemen:
- **GitHub Issues:** Repository Issues erstellen
- **Email:** Liaia@outlook.de
- **Discord:** Community Server (falls vorhanden)

---

**🌟 Zeige WAEngine deine Unterstützung mit einem GitHub Star!**