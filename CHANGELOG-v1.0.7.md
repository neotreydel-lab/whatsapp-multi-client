# 📋 Changelog v1.0.7

## 🆕 Neue Features

### 🎯 **Chat-spezifisches Prefix System**
- **PrefixManager Klasse** - Verwaltet Prefixes pro Chat/Gruppe
- **Persistent Storage** - Prefixes werden automatisch gespeichert
- **Admin-only Changes** - Nur Admins können Prefixes in Gruppen ändern
- **Validierung** - Max 5 Zeichen, keine Leerzeichen
- **Statistics** - Übersicht über alle verwendeten Prefixes

### 📋 **Neue Commands**
- `!setprefix <prefix>` - Prefix für aktuellen Chat setzen (Admin only)
- `!prefixinfo` - Prefix Informationen anzeigen
- `!resetprefix` - Prefix auf Standard zurücksetzen (Admin only)
- `!allprefixes` - Alle Prefixes anzeigen (Owner only)

### 🔧 **Erweiterte Client-Funktionen**
```javascript
// Chat-spezifische Prefixes
client.setChatPrefix(chatId, "#")
client.getChatPrefix(chatId)
client.removeChatPrefix(chatId)

// Prefix Statistics
client.getPrefixStats()
client.getAllPrefixes()
```

### 💾 **Persistent Storage**
- Prefixes werden in `./data/prefixes.json` gespeichert
- Automatisches Laden beim Start
- Backup-System für Prefix-Daten

## 🔄 **Verbesserungen**

### **WhatsAppClient erweitert**
- Rückwärtskompatibel mit bestehenden `setPrefix()` Funktionen
- Neue `prefixManager` Instanz für erweiterte Funktionen
- Verbesserte Command-Erkennung mit Chat-spezifischen Prefixes

### **Message Object erweitert**
- Neue `prefix` Property zeigt verwendeten Prefix
- Verbesserte Command-Parsing für verschiedene Prefixes

## 📊 **Beispiele**

### **Basic Usage**
```javascript
import { WhatsAppClient } from "waengine";

const client = new WhatsAppClient();
client.setPrefix("!"); // Global fallback

// Chat-spezifische Prefixes
client.setChatPrefix("120363423649822867@g.us", "#");
client.setChatPrefix("491234567890@s.whatsapp.net", ".");

await client.connect();
```

### **Mit Commands**
```javascript
client.addCommand('setprefix', async (msg, args) => {
    if (msg.isGroup && !(await msg.isAdmin())) {
        return msg.reply('❌ Nur Admins können den Prefix ändern!');
    }
    
    const newPrefix = args[0];
    client.setChatPrefix(msg.from, newPrefix);
    await msg.reply(`✅ Prefix geändert zu: "${newPrefix}"`);
});
```

## 🔒 **Security Features**
- ✅ Admin-only Prefix-Änderungen in Gruppen
- ✅ Owner-only globale Prefix-Übersicht
- ✅ Validierung gegen schädliche Prefixes
- ✅ Fallback auf Global-Prefix bei Fehlern

## 📈 **Performance**
- Minimaler Memory-Overhead durch Map-basierte Storage
- Lazy Loading der Prefix-Daten
- Optimierte Command-Erkennung

## 🐛 **Bug Fixes**
- Verbesserte Error-Handling bei Command-Parsing
- Stabilere Prefix-Validierung
- Bessere Fallback-Mechanismen

## 🔄 **Breaking Changes**
**Keine!** - Vollständig rückwärtskompatibel mit v1.0.6

## 📦 **Installation**
```bash
npm install waengine@1.0.7
```

## 🎯 **Migration von v1.0.6**
Keine Migration nötig! Alle bestehenden Funktionen funktionieren weiterhin.

**Neue Features sind optional und können schrittweise eingeführt werden.**

---

**🚀 WAEngine v1.0.7 - Jetzt mit Chat-spezifischen Prefixes!**