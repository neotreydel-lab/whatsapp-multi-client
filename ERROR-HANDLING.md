# 🆘 WAEngine Error Handling System

WAEngine verfügt über ein umfassendes Error Handling System mit automatischen Support-Kontakt-Informationen und detailliertem Error-Reporting.

## 🚀 Quick Start

### Basic Setup
```javascript
import { WhatsAppClient } from "waengine";

const client = new WhatsAppClient({
    supportEmail: "deine-email@domain.de",
    supportDiscord: "https://discord.gg/dein-server",
    supportGitHub: "https://github.com/dein-username/dein-repo/issues"
});
```

### EasyBot Setup
```javascript
import { createBot } from "waengine";

const bot = createBot()
    .setSupportContact(
        "support@meinbot.de",
        "https://discord.gg/meinbot",
        "https://github.com/meinuser/meinbot/issues"
    )
    .when("hello").reply("Hi! 👋")
    .start();
```

## 🔧 Konfiguration

### Error Handler Optionen
```javascript
const client = new WhatsAppClient({
    // Support Kontakte
    supportEmail: "support@domain.de",
    supportDiscord: "https://discord.gg/server",
    supportGitHub: "https://github.com/user/repo/issues",
    
    // Error Handling Settings
    showSupportInfo: true,        // Support-Info bei Fehlern anzeigen
    logErrors: true,             // Fehler detailliert loggen
    sendErrorReports: false,     // Automatische Fehlerberichte
});
```

## 📊 Error Types

Das System behandelt verschiedene Fehler-Typen automatisch:

### 1. Connection Errors
```javascript
// Automatisch behandelt bei:
// - Verbindungsabbrüchen
// - QR-Code Problemen
// - Socket-Fehlern
// - Wiederverbindungs-Fehlern
```

### 2. Command Errors
```javascript
client.addCommand('test', async (msg) => {
    try {
        // Dein Command Code
        throw new Error("Test Fehler");
    } catch (error) {
        // Error Handler wird automatisch aufgerufen
        await msg.reply("❌ Fehler aufgetreten! Support benachrichtigt.");
    }
});
```

### 3. Plugin Errors
```javascript
// Automatisch behandelt bei:
// - Plugin Loading Fehlern
// - Plugin Execution Fehlern
// - Dependency Problemen
```

### 4. Message Errors
```javascript
// Automatisch behandelt bei:
// - Media Upload Fehlern
// - Sticker Creation Fehlern
// - Message Send Fehlern
```

## 🆘 Support Information Display

Bei Fehlern wird automatisch folgende Information angezeigt:

```
============================================================
🆘 BRAUCHEN SIE HILFE? KONTAKTIEREN SIE UNS!
============================================================
📧 Email Support: support@domain.de
💬 Discord Community: https://discord.gg/server
🐛 Bug Report: https://github.com/user/repo/issues

📋 FEHLER-INFORMATIONEN FÜR SUPPORT:
   Error ID: WAE-1704067200000-1
   WAEngine Version: 1.7.3
   Node.js Version: v18.17.0
   Platform: win32
   Context: connection

💡 SCHNELLE LÖSUNGEN:
   • Löschen Sie den 'auth' Ordner und scannen Sie QR neu
   • Stellen Sie sicher, dass WhatsApp Web nicht anderweitig geöffnet ist
============================================================
```

## 🔍 Quick Fixes

Das System zeigt automatisch passende Lösungsvorschläge:

### QR/Auth Probleme
- Löschen Sie den 'auth' Ordner
- Scannen Sie QR-Code neu
- WhatsApp Web schließen

### Connection Probleme
- Internetverbindung prüfen
- In ein paar Minuten erneut versuchen
- Bot neu starten

### Plugin Probleme
- Dependencies installieren: `npm install --force`
- Plugin-spezifische Abhängigkeiten prüfen

### Sharp/Sticker Probleme
- Sharp installieren: `npm install sharp`
- Windows: `npm install --platform=win32 sharp`

### Permission Probleme
- Bot braucht Admin-Rechte in Gruppe
- Gruppenberechtigung prüfen

## 📈 Error Statistics

### Error Stats abrufen
```javascript
// Advanced Client
const stats = client.errorHandler.getErrorStats();
console.log(`Total Errors: ${stats.totalErrors}`);

// EasyBot
const stats = bot.getErrorStats();
console.log(`Total Errors: ${stats.totalErrors}`);
```

### Error Stats Command
```javascript
client.addCommand('errors', async (msg) => {
    if (!(await msg.isAdmin())) return;
    
    const stats = client.errorHandler.getErrorStats();
    await msg.reply(`📊 Fehler-Statistiken:\n` +
                   `• Total: ${stats.totalErrors}\n` +
                   `• Support: ${stats.supportContacts.email}`);
});
```

## 🎯 Custom Error Handling

### Error Event Listener
```javascript
client.on('error', (error, context) => {
    console.log(`🔥 Custom Error: ${error.message}`);
    
    // Custom Actions:
    // - Email senden
    // - Discord Webhook
    // - Database Log
    // - Slack Notification
});
```

### Manual Error Handling
```javascript
// Connection Error
client.errorHandler.handleConnectionError(error, attemptNumber);

// Plugin Error
client.errorHandler.handlePluginError(error, pluginName);

// Command Error
client.errorHandler.handleCommandError(error, commandName, userId);

// Message Error
client.errorHandler.handleMessageError(error, messageType);

// Generic Error
client.errorHandler.handleError(error, {
    action: 'custom_action',
    details: 'Custom error details'
});
```

## 🚀 Production Setup

### 1. Email Integration
```javascript
client.on('error', async (error, context) => {
    await sendEmail({
        to: 'admin@domain.de',
        subject: `Bot Error: ${error.message}`,
        body: `Error ID: ${context.errorId}\nDetails: ${error.stack}`
    });
});
```

### 2. Discord Webhook
```javascript
client.on('error', async (error, context) => {
    await fetch('https://discord.com/api/webhooks/YOUR_WEBHOOK', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: `🚨 Bot Error: ${error.message}`,
            embeds: [{
                title: 'Error Details',
                fields: [
                    { name: 'Error ID', value: context.errorId },
                    { name: 'Context', value: context.action },
                    { name: 'Time', value: new Date().toISOString() }
                ]
            }]
        })
    });
});
```

### 3. Database Logging
```javascript
client.on('error', async (error, context) => {
    await database.errors.create({
        errorId: context.errorId,
        message: error.message,
        stack: error.stack,
        context: context,
        timestamp: new Date()
    });
});
```

### 4. Automatic Error Reporting
```javascript
const client = new WhatsAppClient({
    sendErrorReports: true, // Aktiviert automatische Reports
    supportEmail: "support@domain.de"
});
```

## 🛠️ EasyBot Error Methods

### Support Contact konfigurieren
```javascript
bot.setSupportContact(
    "support@domain.de",
    "https://discord.gg/server",
    "https://github.com/user/repo/issues"
);
```

### Error Reporting aktivieren
```javascript
bot.enableErrorReporting(true);
```

### Error Handler hinzufügen
```javascript
bot.onError((error, context) => {
    console.log(`EasyBot Error: ${error.message}`);
});
```

### Error Stats abrufen
```javascript
const stats = bot.getErrorStats();
```

## 📝 Error ID Format

Jeder Fehler erhält eine eindeutige ID:
```
WAE-{timestamp}-{errorCount}
Beispiel: WAE-1704067200000-1
```

## 🔄 Error Recovery

Das System versucht automatisch:
- **Connection Errors**: Robuste Wiederverbindung
- **Plugin Errors**: Plugin-Reload
- **Command Errors**: Graceful Failure
- **Message Errors**: Retry mit Fallback

## 📚 Beispiele

Siehe `error-handling-demo.js` für vollständige Beispiele:
- Basic Error Handling
- Custom Support Info
- Error Statistics
- Production Setup

## 🎯 Best Practices

1. **Immer Support-Kontakt konfigurieren**
2. **Error Events für Custom Actions nutzen**
3. **Error Stats für Monitoring verwenden**
4. **Quick Fixes für häufige Probleme dokumentieren**
5. **Production: Automatische Benachrichtigungen einrichten**

---

*Das Error Handling System macht WAEngine noch robuster und benutzerfreundlicher! 🚀*