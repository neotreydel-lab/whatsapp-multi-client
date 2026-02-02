# 📋 WAEngine v1.0.11 Changelog

> **🔄 Auto-Restart System - Automatischer Neustart nach Logout**

---

## 🚀 Neue Features

### **🔄 Auto-Restart System**
- **NEU:** Automatischer Neustart nach WhatsApp Logout
- **NEU:** Konfigurierbare Restart-Verzögerung
- **NEU:** Retry-Mechanismus bei fehlgeschlagenem Restart
- **NEU:** EasyBot Integration für Auto-Restart

```javascript
// Auto-Restart aktivieren
const client = new WhatsAppClient({
    autoRestart: true,      // Automatischer Neustart
    restartDelay: 5000      // 5 Sekunden Wartezeit
});

// EasyBot mit Auto-Restart
quickBot()
    .enableAutoRestart(true, 5)  // 5 Sekunden Delay
    .when("hello").reply("Hi!")
    .start();
```

---

## 🔧 Neue API-Methoden

### **WhatsAppClient Auto-Restart**
- `enableAutoRestart(enabled, delay)` - Auto-Restart konfigurieren
- `disableAutoRestart()` - Auto-Restart deaktivieren
- `setRestartDelay(seconds)` - Restart-Verzögerung setzen

### **EasyBot Auto-Restart**
- `enableAutoRestart(enabled, delay)` - Auto-Restart für EasyBot
- `disableAutoRestart()` - Auto-Restart deaktivieren

---

## 🎯 Funktionsweise

### **Was passiert bei Logout:**
1. **Logout erkannt** - WhatsApp Verbindung getrennt
2. **Session bereinigt** - Alte Auth-Daten entfernt (optional)
3. **Wartezeit** - Konfigurierbare Pause (Standard: 5 Sekunden)
4. **Neuer Start** - Automatische Neuverbindung
5. **QR-Code** - Neuer QR-Code wird angezeigt
6. **Retry** - Bei Fehler automatischer Retry nach 10 Sekunden

### **Vorher vs. Nachher:**
```javascript
// ❌ Vorher (v1.0.10) - Bot stoppt bei Logout
👋 Ausgeloggt - bereinige Session...
🧹 Session automatisch bereinigt
❌ Error: Logged out
// Bot ist gestoppt, manueller Neustart nötig

// ✅ Jetzt (v1.0.11) - Automatischer Neustart
👋 Ausgeloggt - bereinige Session...
🧹 Session automatisch bereinigt
🔄 Auto-Restart in 5 Sekunden...
📱 Neuer QR-Code wird generiert...
🚀 Starte neue Session...
✅ Auto-Restart erfolgreich!
// Bot läuft weiter, neuer QR-Code verfügbar
```

---

## ⚙️ Konfiguration

### **Standard-Einstellungen:**
```javascript
const client = new WhatsAppClient({
    autoRestart: true,      // Auto-Restart aktiviert
    restartDelay: 5000,     // 5 Sekunden Wartezeit
    autoCleanup: true       // Session-Bereinigung aktiviert
});
```

### **Runtime-Konfiguration:**
```javascript
// Auto-Restart aktivieren mit 10 Sekunden Delay
client.enableAutoRestart(true, 10000);

// Delay auf 7 Sekunden ändern
client.setRestartDelay(7);

// Auto-Restart deaktivieren
client.disableAutoRestart();
```

### **EasyBot Integration:**
```javascript
quickBot()
    .enableAutoRestart(true, 5)  // 5 Sekunden Delay
    .when("status").reply("🔄 Auto-Restart ist aktiviert!")
    .start();
```

---

## 🛡️ Fehlerbehandlung

### **Retry-Mechanismus:**
- **Erster Versuch:** Sofortiger Restart nach Wartezeit
- **Bei Fehler:** Automatischer Retry nach 10 Sekunden
- **Bei erneutem Fehler:** Manueller Neustart erforderlich

### **Event-System:**
```javascript
client.on('disconnected', (data) => {
    if (data.reason === 'logged_out') {
        console.log('👋 Logout erkannt - Auto-Restart startet...');
    }
});

client.on('connected', () => {
    console.log('✅ Verbindung wiederhergestellt!');
});
```

---

## 🎮 Use Cases

### **24/7 Bots:**
- **Server-Bots** die dauerhaft laufen sollen
- **Monitoring-Bots** für kontinuierliche Überwachung
- **Service-Bots** mit hoher Verfügbarkeit

### **Development:**
- **Weniger Unterbrechungen** während der Entwicklung
- **Automatische Wiederverbindung** bei Session-Problemen
- **Bessere Developer Experience**

### **Production:**
- **Höhere Uptime** für produktive Bots
- **Weniger manuelle Eingriffe** erforderlich
- **Robustere Bot-Infrastruktur**

---

## 🔧 Technische Details

### **Implementierung:**
- Auto-Restart läuft im `connection.update` Event-Handler
- Session-Bereinigung vor Neustart (optional)
- QR-Browser wird automatisch geschlossen und neu geöffnet
- Promise-basierte Fehlerbehandlung mit Retry-Logic

### **Performance:**
- **Minimaler Overhead** - nur bei Logout aktiv
- **Konfigurierbare Delays** - anpassbar an Netzwerk-Bedingungen
- **Graceful Shutdown** - saubere Bereinigung vor Neustart

---

## 🚨 Breaking Changes

**Keine Breaking Changes!**

Alle bestehenden Bots funktionieren weiterhin. Auto-Restart ist standardmäßig aktiviert, kann aber deaktiviert werden.

---

## 💡 Upgrade-Anleitung

### **Von v1.0.10 auf v1.0.11:**

1. **Update installieren:**
```bash
npm update waengine
```

2. **Auto-Restart nutzen (optional):**
```javascript
// Standardmäßig bereits aktiviert
const client = new WhatsAppClient({
    autoRestart: true,      // Bereits Standard
    restartDelay: 5000      // 5 Sekunden Standard
});

// Oder deaktivieren falls nicht gewünscht
const client = new WhatsAppClient({
    autoRestart: false
});
```

3. **Testen:**
```bash
node your-bot.js
# Bot verbinden, dann in WhatsApp ausloggen
# Auto-Restart sollte automatisch starten
```

---

## 🎯 Beispiel-Implementierung

### **Vollständiger Bot mit Auto-Restart:**
```javascript
import { quickBot } from "waengine";

const bot = quickBot()
    .enableAutoRestart(true, 3)  // 3 Sekunden Delay
    .when("hello").reply("Hi! 👋")
    .when("status").reply("🔄 Auto-Restart aktiviert!")
    .when("restart").reply("Bei Logout starte ich automatisch neu!")
    .start();

// Event-Handler
bot.client.on('disconnected', (data) => {
    if (data.reason === 'logged_out') {
        console.log('👋 Logout - Auto-Restart startet...');
    }
});

bot.client.on('connected', () => {
    console.log('✅ Bot ist wieder online!');
});
```

---

## 🙏 Danksagungen

Vielen Dank für das Feedback! Das Auto-Restart System macht WAEngine noch robuster und benutzerfreundlicher.

---

**🔄 WAEngine v1.0.11 - Nie wieder manueller Neustart nach Logout!**