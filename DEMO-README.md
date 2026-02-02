# 🤖 WAEngine EasyBot Demo

Einfache Demo für WAEngine v1.7.3 EasyBot

## 🚀 Setup

1. **Ordner erstellen und Dateien kopieren:**
```bash
mkdir waengine-demo
cd waengine-demo
```

2. **Diese Dateien kopieren:**
- `simple-easybot-demo.js` (oder `mini-easybot.js`)
- `demo-package.json` → umbenennen zu `package.json`

3. **WAEngine installieren:**
```bash
npm install waengine
```

4. **Bot starten:**
```bash
node simple-easybot-demo.js
```

## 📱 Verwendung

1. **QR-Code scannen** mit WhatsApp
2. **Commands testen:**
   - `help` - Alle Commands anzeigen
   - `hallo` - Begrüßung
   - `test` - Action Chaining Demo
   - `typing demo` - Typing-Geschwindigkeiten
   - `ping` - Pong Response

## 🎯 Verfügbare Demos

### **simple-easybot-demo.js**
- Vollständige Demo mit allen Features
- Action Chaining
- Typing Demos
- Templates
- Auto Responses

### **mini-easybot.js**
- Minimale Version (nur 15 Zeilen!)
- Grundlegende Funktionen
- Perfekt zum Lernen

## 🔧 Anpassungen

```javascript
// Bot-Einstellungen ändern
const bot = EasyBot.create({
    authDir: './auth',           // Auth-Ordner
    quietHeartbeat: true,        // Heartbeat-Spam aus
    printQR: false              // QR im Browser
});

// Neue Commands hinzufügen
bot.when('mein command').reply('Meine Antwort!');

// Auto-Responses
bot.autoReply('trigger', 'antwort');
```

## 🚀 Features

- ✅ **3-Zeilen Bot Creation**
- ✅ **Action Chaining** (jQuery-Style)
- ✅ **Typing Indicator**
- ✅ **Auto Responses**
- ✅ **Templates mit Variablen**
- ✅ **Conditional Logic**
- ✅ **Advanced Features** (Buttons, Lists, etc.)
- ✅ **Robuste Verbindung**
- ✅ **Heartbeat-Spam Fix**

## 📚 Dokumentation

Vollständige Dokumentation: [WAEngine Features](https://github.com/your-repo/FEATURES.md)

---

**🎉 Viel Spaß mit WAEngine EasyBot!**