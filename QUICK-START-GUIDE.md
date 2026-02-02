# 🚀 WAEngine v1.0.4 - Quick Start Guide

## Installation

```bash
npm install waengine
```

## Einfacher Start

```javascript
import { WhatsAppClient } from "waengine";

const client = new WhatsAppClient({
    authDir: "./auth",
    printQR: true, // Terminal QR (empfohlen für erste Tests)
    browser: ["MeinBot", "1.0.0", ""]
});

// Prefix für Commands
client.setPrefix("!");

// Commands hinzufügen
client.addCommand('ping', async (msg) => {
    await msg.reply('🏓 Pong!');
});

client.addCommand('help', async (msg) => {
    await msg.reply('📋 Commands: !ping, !help');
});

// Events
client.on('connected', () => {
    console.log("✅ Bot verbunden!");
});

client.on('message', async (msg) => {
    console.log(`📨 Nachricht: "${msg.text}"`);
    
    if (msg.text === 'hallo') {
        await msg.reply('Hallo zurück! 👋');
    }
});

// Verbinden
await client.connect();
```

## QR-Code Optionen

### Terminal QR (Empfohlen)
```javascript
const client = new WhatsAppClient({
    printQR: true // QR-Code im Terminal
});
```

### Browser QR
```javascript
const client = new WhatsAppClient({
    printQR: false // QR-Code im Browser (Edge)
});
```

## ✅ Was ist in v1.0.4 behoben?

### 🔧 Message-Empfang Problem
- **Problem:** Neue Benutzer bekommen keine Nachrichten
- **Lösung:** Event-Handler werden sofort registriert, nicht erst nach QR-Scan

### 🔧 QR-Code Problem  
- **Problem:** Browser zeigt falschen WhatsApp Web QR-Code
- **Lösung:** Baileys QR-Code wird korrekt in Browser injiziert

### 🔧 Baileys 7.0.0 Kompatibilität
- **Problem:** `printQRInTerminal` deprecated
- **Lösung:** Eigenes QR-System implementiert

## 🧪 Test-Nachrichten

Nach dem QR-Scan sende diese Nachrichten zum Testen:

- `hallo` → Bot antwortet mit "Hallo zurück!"
- `!ping` → Bot antwortet mit "Pong!"
- `!help` → Zeigt verfügbare Commands

## 🚨 Troubleshooting

### Keine Nachrichten empfangen?
1. Prüfe ob QR-Code gescannt wurde
2. Sende Testnachricht "hallo"
3. Prüfe Console-Output

### QR-Code funktioniert nicht?
1. Verwende `printQR: true` für Terminal QR
2. Scanne QR-Code im Terminal, nicht im Browser
3. Stelle sicher dass WhatsApp aktuell ist

### Connection Errors?
1. Prüfe Internetverbindung
2. Prüfe Firewall/Antivirus
3. Versuche anderen Browser

## 📚 Weitere Features

- **Typing Indicators:** `msg.typeAndReply()`, `msg.realisticType()`
- **Polls:** `msg.sendPoll(question, options)`
- **Group Management:** `client.kick.user()`, `client.promote.user()`
- **Stats:** `msg.stats.getMessageCount()`
- **Multi-Device Support:** Vollständig unterstützt

## 🔗 Links

- **npm:** https://www.npmjs.com/package/waengine
- **GitHub:** https://github.com/neotreydel-lab/whatsapp-multi-client

---

**WAEngine v1.0.4** - Jetzt funktioniert es für alle! 🎉