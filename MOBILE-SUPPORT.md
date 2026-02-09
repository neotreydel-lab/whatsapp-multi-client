# 📱 Mobile Support Documentation

Die WAEngine Library unterstützt jetzt vollständig mobile Umgebungen wie Termux (Android), iSH (iOS) und andere mobile Plattformen.

## 🚀 Unterstützte Mobile Plattformen

### Android
- **Termux**: Vollständige Unterstützung mit optimierten Pfaden und Berechtigungen
- **Acode**: Code-Editor App Unterstützung
- **Allgemeine Android Umgebungen**

### iOS
- **iSH**: Linux Shell für iOS mit angepassten Optimierungen
- **Allgemeine iOS Umgebungen**

## 📋 Features

### Automatische Erkennung
- Erkennt automatisch mobile Umgebungen
- Plattform-spezifische Optimierungen
- Angepasste Konfigurationen für jede Plattform

### Mobile Optimierungen
- **Speicher**: Reduzierte Speichernutzung (256-512MB)
- **Batterie**: Energiesparende Einstellungen
- **Netzwerk**: Optimiert für mobile Datenverbindungen
- **Performance**: CPU-optimierte Operationen

### QR Code Anpassungen
- Kleinere QR Codes für mobile Bildschirme
- Terminal-basierte QR Codes bevorzugt
- Automatische Größenanpassung je nach Plattform

## 🛠️ Installation

### Termux (Android)
```bash
# Pakete aktualisieren
pkg update && pkg upgrade

# Node.js installieren
pkg install nodejs

# Optional: Zusätzliche Pakete
pkg install git python ffmpeg imagemagick
```

### iSH (iOS)
```bash
# Pakete aktualisieren
apk update

# Node.js installieren
apk add nodejs npm

# Optional: Git installieren
apk add git
```

## 💻 Verwendung

### Basis Setup
```javascript
import { MobileSupport } from './src/mobile-support.js';

// Automatische Initialisierung
const mobileSupport = new MobileSupport(client);

// Mobile Umgebung prüfen
if (mobileSupport.isMobileEnvironment()) {
    console.log('Mobile Plattform erkannt:', mobileSupport.getMobileType());
}
```

### Mobile Konfiguration abrufen
```javascript
// Mobile Informationen
const mobileInfo = mobileSupport.getMobileInfo();
console.log(mobileInfo);

// Mobile Fähigkeiten
const capabilities = mobileSupport.getMobileCapabilities();
console.log(capabilities);

// QR Code Konfiguration
const qrConfig = mobileSupport.getMobileQRConfig();
console.log(qrConfig);
```

### Pfade und Speicher
```javascript
// Mobile Speicherpfade
const storagePath = mobileSupport.getMobileStoragePath();
const downloadPath = mobileSupport.getMobileDownloadPath();

// Session Konfiguration
const sessionConfig = mobileSupport.getMobileSessionConfig();
```

## 🔧 Konfiguration

### Termux Spezifisch
```javascript
// Termux Pfade
const termuxPaths = {
    home: '/data/data/com.termux/files/home',
    storage: '/data/data/com.termux/files/home/storage',
    shared: '/storage/emulated/0',
    downloads: '/storage/emulated/0/Download'
};

// Termux Berechtigungen prüfen
const hasStorage = mobileSupport.checkTermuxStoragePermission();
const hasCamera = mobileSupport.checkTermuxCameraPermission();
const hasMicrophone = mobileSupport.checkTermuxMicrophonePermission();
```

### iOS/iSH Spezifisch
```javascript
// iSH Pfade
const ishPaths = {
    home: '/root',
    documents: '/root/Documents',
    downloads: '/root/Downloads'
};

// iOS Optimierungen
const iosOptimizations = {
    memoryLimit: 256, // MB
    backgroundMode: false,
    pushNotifications: false,
    fileAccess: 'limited'
};
```

## ⚡ Performance Optimierungen

### Speicher Optimierung
- Automatische Garbage Collection
- Reduzierte Speicherlimits
- Lazy Loading von Modulen

### Batterie Optimierung
- Reduzierte Animationen
- Sleep Mode Unterstützung
- Deaktivierte Hintergrund-Synchronisation

### Netzwerk Optimierung
- Komprimierung aktiviert
- Längere Timeouts für mobile Netzwerke
- Offline-Modus Unterstützung

## 🧪 Testing

```bash
# Mobile Support testen
node mobile-support-test.js

# Spezifische Plattform testen
TERMUX_VERSION=1 node mobile-support-test.js  # Termux simulieren
ISH_VERSION=1 node mobile-support-test.js     # iSH simulieren
```

## 📱 Mobile Features

### QR Code Features
- Angepasste Größen für mobile Bildschirme
- Terminal-optimierte Darstellung
- Automatische Aktualisierung

### Touch Optimierungen
- Swipe Gesten Unterstützung
- Tap-to-Select Funktionalität
- Long-Press Menüs

### Benachrichtigungen
- Batterie-schonende Benachrichtigungen
- Vibration (nur Android)
- Badge Unterstützung

### Speicher Management
- Komprimierte Speicherung
- Automatische Bereinigung
- Größenlimits (100MB Standard)

## 🔍 Debugging

### Environment Variables
```bash
# Debug Modus aktivieren
export DEBUG=waengine:mobile

# Termux simulieren
export TERMUX_VERSION=1
export PREFIX=/data/data/com.termux/files/usr

# iSH simulieren
export ISH_VERSION=1
```

### Log Ausgaben
```javascript
// Mobile Informationen loggen
console.log('Mobile Environment:', mobileSupport.getMobileInfo());

// Fehler Behandlung
mobileSupport.handleMobileError(error, 'context');
```

## 🚨 Bekannte Limitierungen

### Termux
- Speicher begrenzt auf verfügbaren RAM
- Einige Node.js Module benötigen native Kompilierung
- Berechtigungen müssen manuell erteilt werden

### iSH (iOS)
- Sehr begrenzte Speicher- und CPU-Ressourcen
- Nicht alle Node.js Features verfügbar
- App Store Beschränkungen

### Allgemeine Mobile Limitierungen
- Reduzierte Performance im Vergleich zu Desktop
- Batterieverbrauch bei intensiver Nutzung
- Netzwerk-Instabilität bei mobilen Verbindungen

## 📚 Weitere Ressourcen

- [Termux Wiki](https://wiki.termux.com/)
- [iSH Documentation](https://ish.app/)
- [Node.js Mobile Best Practices](https://nodejs.org/en/docs/guides/)

## 🤝 Beitragen

Wenn du Verbesserungen für mobile Plattformen hast:

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Teste auf verschiedenen mobilen Plattformen
4. Erstelle einen Pull Request

## 📄 Lizenz

Mobile Support ist Teil der WAEngine Library und unterliegt derselben Lizenz.