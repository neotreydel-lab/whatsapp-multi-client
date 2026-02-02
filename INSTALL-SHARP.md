# 🎨 Sharp Installation für Sticker-Features

## Warum Sharp?
Sharp ist essentiell für die Sticker-Erstellung in WAEngine v1.0.8:
- **Bild-Verarbeitung**: Resize, Crop, Format-Konvertierung
- **WebP Support**: Optimale Sticker-Formate für WhatsApp
- **Performance**: Schnelle Verarbeitung großer Bilder
- **Text-Sticker**: SVG zu Bild Konvertierung

## Installation

### 1. Sharp installieren
```bash
npm install sharp@^0.33.2
```

### 2. Bei Problemen (Windows/Linux)
```bash
# Rebuild Sharp für dein System
npm rebuild sharp

# Oder komplett neu installieren
npm uninstall sharp
npm install sharp --platform=win32 --arch=x64
```

### 3. Für Docker/Linux
```bash
# Für Alpine Linux
apk add --no-cache libc6-compat

# Für Ubuntu/Debian
apt-get update && apt-get install -y libvips-dev
```

## Sticker-Features nach Installation

### ✅ Was funktioniert mit Sharp:

```javascript
// 🖼️ Bild zu Sticker (mit Resize/Crop)
await msg.create.sticker.fromImage('./photo.jpg', {
    pack: 'Mein Pack',
    author: 'Bot',
    quality: 'high',
    crop: true,
    width: 512,
    height: 512
});

// 🌐 URL zu Sticker (automatische Verarbeitung)
await msg.create.sticker.fromUrl('https://example.com/image.jpg', {
    pack: 'URL Stickers',
    quality: 'medium'
});

// 📝 Text zu Sticker (SVG Rendering)
await msg.create.sticker.fromText('Hello World!', {
    backgroundColor: '#FF6B6B',
    textColor: '#FFFFFF',
    fontSize: 64,
    width: 512,
    height: 512
});

// 🎬 Video/GIF zu animiertem Sticker
await msg.create.sticker.fromVideo('./animation.gif', {
    animated: true,
    quality: 'high',
    duration: 6,
    fps: 15
});

// 💾 Buffer zu Sticker (direkte Verarbeitung)
const imageBuffer = fs.readFileSync('image.png');
await msg.create.sticker.fromMedia(imageBuffer, {
    pack: 'Buffer Stickers',
    crop: true
});
```

### 🎛️ Verfügbare Optionen:

```javascript
const stickerOptions = {
    // Metadaten
    pack: 'Sticker Pack Name',      // Sticker-Pack Name
    author: 'Bot Name',             // Autor Name
    
    // Verarbeitung
    quality: 'high',                // 'high', 'medium', 'low'
    crop: true,                     // Quadratisch croppen
    width: 512,                     // Ziel-Breite
    height: 512,                    // Ziel-Höhe
    
    // Animation (für Videos/GIFs)
    animated: true,                 // Animierter Sticker
    duration: 6,                    // Max Dauer in Sekunden
    fps: 15,                        // Frames per Second
    
    // Text-Sticker
    backgroundColor: '#FFFFFF',     // Hintergrundfarbe
    textColor: '#000000',          // Textfarbe
    fontSize: 64,                   // Schriftgröße
    fontFamily: 'Arial',           // Schriftart
    padding: 50                     // Text-Padding
};
```

## Troubleshooting

### Problem: "Cannot find module 'sharp'"
```bash
npm install sharp
```

### Problem: "Sharp installation failed"
```bash
# Lösche node_modules und installiere neu
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Platform mismatch"
```bash
# Rebuild für dein System
npm rebuild sharp
```

### Problem: "libvips error"
```bash
# Linux: Installiere libvips
sudo apt-get install libvips-dev

# macOS: Installiere mit Homebrew
brew install vips
```

## Performance-Tipps

### 1. Qualitäts-Einstellungen
```javascript
// Schnell & klein
{ quality: 'low', width: 256, height: 256 }

// Ausgewogen
{ quality: 'medium', width: 512, height: 512 }

// Beste Qualität
{ quality: 'high', width: 512, height: 512 }
```

### 2. Batch-Verarbeitung
```javascript
// Mehrere Sticker gleichzeitig
const images = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
const promises = images.map(img => 
    msg.create.sticker.fromImage(img, { pack: 'Batch Pack' })
);
await Promise.all(promises);
```

### 3. Cleanup
```javascript
// Automatisches Cleanup nach Verarbeitung
msg.create.cleanup(); // Löscht temp-Dateien
```

## Ohne Sharp (Fallback)

Falls Sharp nicht installiert werden kann:
- Text-Sticker werden als normale Nachrichten gesendet
- Bild-Sticker werden ohne Verarbeitung gesendet
- Animierte Sticker funktionieren nicht
- Qualitäts-Optimierung entfällt

## Test-Commands

Nach der Installation teste mit:
```bash
node hidetag-sticker-record-test.js
```

Verfügbare Test-Commands:
- `!sticker-url <url>` - Sticker aus URL
- `!sticker-text <text>` - Text-Sticker  
- `!sticker-demo` - Alle Sticker-Features
- Sende Bild mit Caption "sticker" für Auto-Sticker

## Erfolgreiche Installation prüfen

```javascript
// Test ob Sharp verfügbar ist
try {
    const sharp = require('sharp');
    console.log('✅ Sharp erfolgreich installiert:', sharp.versions);
} catch (error) {
    console.log('❌ Sharp nicht verfügbar:', error.message);
}
```

---

**Nach der Sharp-Installation sind alle Sticker-Features voll funktionsfähig! 🎨**