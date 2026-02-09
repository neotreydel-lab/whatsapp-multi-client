# WAEngine Error Codes Dokumentation

Vollständige Übersicht aller WAEngine Fehlercodes mit Beschreibungen und Lösungen.

## 📋 Inhaltsverzeichnis

- [Connection Errors (1xxx)](#connection-errors-1xxx)
- [Authentication Errors (2xxx)](#authentication-errors-2xxx)
- [File System Errors (3xxx)](#file-system-errors-3xxx)
- [Message Errors (4xxx)](#message-errors-4xxx)
- [Group Errors (5xxx)](#group-errors-5xxx)
- [Media Errors (6xxx)](#media-errors-6xxx)
- [Command Errors (7xxx)](#command-errors-7xxx)
- [Plugin Errors (8xxx)](#plugin-errors-8xxx)
- [System Errors (9xxx)](#system-errors-9xxx)
- [QR Code Errors (10xxx)](#qr-code-errors-10xxx)
- [Mobile Support Errors (11xxx)](#mobile-support-errors-11xxx)
- [Recovery Errors (12xxx)](#recovery-errors-12xxx)
- [Database Errors (13xxx)](#database-errors-13xxx)
- [Network Errors (14xxx)](#network-errors-14xxx)
- [Security Errors (15xxx)](#security-errors-15xxx)

---

## Connection Errors (1xxx)

### WAE-1001: Connection Failed
**Beschreibung:** Verbindung zu WhatsApp Servern fehlgeschlagen

**Mögliche Ursachen:**
- Keine Internetverbindung
- WhatsApp Server nicht erreichbar
- Firewall blockiert Verbindung
- Proxy-Probleme

**Lösungen:**
1. Prüfe deine Internetverbindung
2. Starte den Bot neu
3. Prüfe Firewall-Einstellungen
4. Versuche es später erneut

**Code-Beispiel:**
```javascript
try {
    await client.connect();
} catch (error) {
    if (error.code === 'WAE-1001') {
        console.log('Verbindung fehlgeschlagen - prüfe Internet');
    }
}
```

---

### WAE-1002: Connection Timeout
**Beschreibung:** Verbindungs-Timeout überschritten

**Mögliche Ursachen:**
- Langsame Internetverbindung
- Server antwortet nicht
- Timeout zu kurz eingestellt

**Lösungen:**
1. Erhöhe das Connection Timeout:
   ```javascript
   const client = new WhatsAppClient({
       connectionTimeout: 180000 // 3 Minuten
   });
   ```
2. Prüfe Netzwerkgeschwindigkeit
3. Versuche es später erneut

---

### WAE-1003: Connection Lost
**Beschreibung:** Verbindung während Betrieb verloren

**Mögliche Ursachen:**
- Internet-Unterbrechung
- WhatsApp Server-Probleme
- Zu viele gleichzeitige Verbindungen

**Lösungen:**
1. Auto-Reconnect aktivieren:
   ```javascript
   const client = new WhatsAppClient({
       autoRestart: true,
       maxReconnectAttempts: 50
   });
   ```
2. Heartbeat aktivieren für bessere Verbindungsstabilität
3. Connection Recovery System nutzen

---


## Authentication Errors (2xxx)

### WAE-2001: Authentication Failed
**Beschreibung:** Authentifizierung fehlgeschlagen

**Mögliche Ursachen:**
- Keine gültige Session vorhanden
- QR-Code nicht gescannt
- Session abgelaufen
- Credentials korrupt

**Lösungen:**
1. Lösche den 'auth' Ordner:
   ```bash
   rm -rf auth
   ```
2. Starte Bot neu und scanne QR-Code
3. Stelle sicher dass WhatsApp auf dem Handy aktiv ist

---

### WAE-2002: Session Expired
**Beschreibung:** Session ist abgelaufen

**Lösungen:**
1. Scanne QR-Code erneut
2. Aktiviere Auto-Backup:
   ```javascript
   const client = new WhatsAppClient({
       autoBackupInterval: 3600000 // 1 Stunde
   });
   ```

---

### WAE-2003: Session Corrupted
**Beschreibung:** Session-Dateien sind beschädigt

**Lösungen:**
1. Nutze Session-Reparatur:
   ```javascript
   await client.repairSession();
   ```
2. Oder lösche auth Ordner komplett
3. Prüfe Speicherplatz

---

### WAE-2004: Invalid Credentials
**Beschreibung:** Ungültige Anmeldedaten

**Lösungen:**
1. Lösche auth Ordner
2. Scanne QR-Code neu
3. Prüfe ob WhatsApp auf Handy aktiv ist

---

### WAE-2005: Logout Detected
**Beschreibung:** Ausloggen erkannt

**Lösungen:**
1. Auto-Restart aktivieren:
   ```javascript
   const client = new WhatsAppClient({
       autoRestart: true,
       restartDelay: 5000
   });
   ```
2. Oder manuell neu verbinden

---

## File System Errors (3xxx)

### WAE-3001: File Not Found
**Beschreibung:** Datei nicht gefunden

**Lösungen:**
1. Prüfe ob Datei existiert
2. Prüfe Dateipfad
3. Verwende absolute Pfade

**Code-Beispiel:**
```javascript
const path = require('path');
const filePath = path.join(__dirname, 'media', 'image.jpg');
await msg.sendImage(filePath);
```

---

### WAE-3002: Permission Denied
**Beschreibung:** Keine Berechtigung für Datei-Operation

**Lösungen:**
1. Führe Bot mit Administrator-Rechten aus
2. Prüfe Datei-Berechtigungen:
   ```bash
   chmod 755 auth
   ```
3. Schließe andere Programme die die Datei verwenden

---

### WAE-3003: Disk Full
**Beschreibung:** Speicherplatz voll

**Lösungen:**
1. Lösche alte Backups
2. Bereinige temp-Ordner
3. Erweitere Speicherplatz

---

### WAE-3004: File Too Large
**Beschreibung:** Datei zu groß

**Lösungen:**
1. Komprimiere Datei
2. Nutze kleinere Dateien
3. WhatsApp Limits beachten (max 16MB für Bilder, 64MB für Videos)

---

### WAE-3005: Invalid File Format
**Beschreibung:** Ungültiges Dateiformat

**Lösungen:**
1. Konvertiere Datei in unterstütztes Format
2. Prüfe Datei-Extension
3. Nutze Sharp für Bildkonvertierung

---

## Message Errors (4xxx)

### WAE-4001: Send Failed
**Beschreibung:** Nachricht konnte nicht gesendet werden

**Lösungen:**
1. Prüfe Verbindung
2. Prüfe ob Nummer/Gruppe existiert
3. Versuche erneut

---

### WAE-4002: Invalid Recipient
**Beschreibung:** Ungültiger Empfänger

**Lösungen:**
1. Prüfe JID Format (z.B. 491234567890@s.whatsapp.net)
2. Prüfe ob Nummer existiert
3. Für Gruppen: @g.us verwenden

---

### WAE-4003: Message Too Long
**Beschreibung:** Nachricht zu lang

**Lösungen:**
1. Teile Nachricht in mehrere Teile
2. WhatsApp Limit: ~65.000 Zeichen

---

### WAE-4004: Media Upload Failed
**Beschreibung:** Media-Upload fehlgeschlagen

**Lösungen:**
1. Prüfe Dateigröße
2. Prüfe Internetverbindung
3. Versuche erneut

---

### WAE-4005: Invalid Format
**Beschreibung:** Ungültiges Nachrichtenformat

**Lösungen:**
1. Prüfe Message-Objekt Struktur
2. Siehe Baileys Dokumentation
3. Nutze WAEngine Helper-Funktionen

---

## Group Errors (5xxx)

### WAE-5001: Not a Group
**Beschreibung:** Chat ist keine Gruppe

**Lösungen:**
1. Prüfe ob JID mit @g.us endet
2. Nutze `msg.isGroup` Check

---

### WAE-5002: Not Admin
**Beschreibung:** Bot ist kein Admin

**Lösungen:**
1. Mache Bot zum Admin
2. Prüfe mit `await msg.isBotAdmin()`

---

### WAE-5003: User Not Found
**Beschreibung:** User nicht in Gruppe gefunden

**Lösungen:**
1. Prüfe ob User in Gruppe ist
2. Nutze `await client.get.GroupParticipants(groupId)`

---

### WAE-5004: Group Not Found
**Beschreibung:** Gruppe nicht gefunden

**Lösungen:**
1. Prüfe Group-ID
2. Prüfe ob Bot in Gruppe ist

---

### WAE-5005: Action Restricted
**Beschreibung:** Aktion eingeschränkt

**Lösungen:**
1. Prüfe Gruppen-Einstellungen
2. Nur Admins können bestimmte Aktionen ausführen

---


## Media Errors (6xxx)

### WAE-6001: Download Failed
**Beschreibung:** Media-Download fehlgeschlagen

**Lösungen:**
1. Prüfe Internetverbindung
2. Versuche erneut
3. Prüfe ob Media noch verfügbar ist

---

### WAE-6002: Conversion Failed
**Beschreibung:** Media-Konvertierung fehlgeschlagen

**Lösungen:**
1. Installiere Sharp: `npm install sharp`
2. Prüfe Eingabeformat
3. Prüfe FFmpeg Installation (für Videos)

---

### WAE-6003: Sticker Creation Failed
**Beschreibung:** Sticker-Erstellung fehlgeschlagen

**Lösungen:**
1. Installiere Sharp: `npm install sharp`
2. Prüfe Bildformat (PNG, JPG, WEBP)
3. Prüfe Bildgröße (max 512x512)

**Code-Beispiel:**
```javascript
try {
    await msg.create.sticker.fromImage('./image.jpg');
} catch (error) {
    if (error.code === 'WAE-6003') {
        await msg.reply('Sharp nicht installiert: npm install sharp');
    }
}
```

---

### WAE-6004: Invalid Media Type
**Beschreibung:** Ungültiger Media-Typ

**Lösungen:**
1. Unterstützte Typen: image, video, audio, document, sticker
2. Prüfe MIME-Type

---

### WAE-6005: Media Too Large
**Beschreibung:** Media-Datei zu groß

**Lösungen:**
1. Komprimiere Datei
2. WhatsApp Limits:
   - Bilder: 16 MB
   - Videos: 64 MB
   - Dokumente: 100 MB

---

## Command Errors (7xxx)

### WAE-7001: Command Not Found
**Beschreibung:** Command nicht gefunden

**Lösungen:**
1. Registriere Command:
   ```javascript
   client.addCommand('test', (msg) => {
       msg.reply('Test Command!');
   });
   ```
2. Prüfe Command-Name

---

### WAE-7002: Execution Failed
**Beschreibung:** Command-Ausführung fehlgeschlagen

**Lösungen:**
1. Prüfe Command-Handler auf Fehler
2. Nutze try-catch in Handler
3. Prüfe Error-Logs

---

### WAE-7003: Invalid Arguments
**Beschreibung:** Ungültige Command-Argumente

**Lösungen:**
1. Validiere Argumente im Handler
2. Zeige Hilfe-Text bei falschen Argumenten

---

### WAE-7004: Permission Denied
**Beschreibung:** Keine Berechtigung für Command

**Lösungen:**
1. Implementiere Permission-System
2. Prüfe User-Rolle vor Ausführung

---

### WAE-7005: Cooldown Active
**Beschreibung:** Command Cooldown aktiv

**Lösungen:**
1. Warte bis Cooldown abgelaufen
2. Implementiere Cooldown-System

---

## Plugin Errors (8xxx)

### WAE-8001: Load Failed
**Beschreibung:** Plugin konnte nicht geladen werden

**Lösungen:**
1. Installiere Dependencies: `npm install`
2. Prüfe Plugin-Pfad
3. Prüfe Plugin-Syntax

---

### WAE-8002: Not Found
**Beschreibung:** Plugin nicht gefunden

**Lösungen:**
1. Prüfe Plugin-Name
2. Prüfe plugins/ Ordner
3. Installiere Plugin

---

### WAE-8003: Invalid Config
**Beschreibung:** Ungültige Plugin-Konfiguration

**Lösungen:**
1. Prüfe config.json
2. Siehe Plugin-Dokumentation
3. Nutze Default-Config

---

### WAE-8004: Dependency Missing
**Beschreibung:** Plugin-Dependency fehlt

**Lösungen:**
1. Installiere Dependencies: `npm install`
2. Prüfe package.json
3. Installiere fehlende Pakete manuell

---

### WAE-8005: Version Incompatible
**Beschreibung:** Plugin-Version inkompatibel

**Lösungen:**
1. Update Plugin
2. Update WAEngine
3. Prüfe Kompatibilitäts-Matrix

---

## System Errors (9xxx)

### WAE-9001: Out of Memory
**Beschreibung:** Speicher voll

**Lösungen:**
1. Erhöhe Node.js Memory Limit:
   ```bash
   node --max-old-space-size=4096 index.js
   ```
2. Nutze Resource Manager
3. Bereinige Memory Leaks

---

### WAE-9002: Process Crashed
**Beschreibung:** Prozess abgestürzt

**Lösungen:**
1. Nutze Process Manager (PM2)
2. Implementiere Auto-Restart
3. Prüfe Error-Logs

---

### WAE-9003: Unknown Error
**Beschreibung:** Unbekannter Fehler

**Lösungen:**
1. Prüfe Error-Logs
2. Kontaktiere Support
3. Erstelle Bug Report

---

### WAE-9004: Configuration Invalid
**Beschreibung:** Ungültige Konfiguration

**Lösungen:**
1. Prüfe Config-Datei
2. Nutze Default-Config
3. Siehe Dokumentation

---

### WAE-9005: Initialization Failed
**Beschreibung:** Initialisierung fehlgeschlagen

**Lösungen:**
1. Prüfe Dependencies
2. Prüfe Berechtigungen
3. Starte neu

---

## QR Code Errors (10xxx)

### WAE-10001: Generation Failed
**Beschreibung:** QR-Code Generierung fehlgeschlagen

**Lösungen:**
1. Installiere qrcode-terminal: `npm install qrcode-terminal`
2. Vergrößere Terminal-Fenster
3. Nutze Browser-QR:
   ```javascript
   const client = new WhatsAppClient({
       printQR: false,
       enableBrowserQR: true
   });
   ```

---

### WAE-10002: Display Failed
**Beschreibung:** QR-Code Anzeige fehlgeschlagen

**Lösungen:**
1. Prüfe Terminal-Kompatibilität
2. Nutze Browser-QR
3. Nutze externe QR-App

---

### WAE-10003: Scan Timeout
**Beschreibung:** QR-Code Scan Timeout

**Lösungen:**
1. Scanne QR-Code schneller
2. Erhöhe Timeout
3. Generiere neuen QR-Code

---

### WAE-10004: Invalid QR Data
**Beschreibung:** Ungültige QR-Daten

**Lösungen:**
1. Starte Bot neu
2. Warte auf neuen QR-Code
3. Prüfe WhatsApp Server Status

---

### WAE-10005: Browser Open Failed
**Beschreibung:** Browser konnte nicht geöffnet werden

**Lösungen:**
1. Installiere Browser (Chrome, Edge, Firefox)
2. Nutze Terminal-QR
3. Öffne URL manuell

---


## Mobile Support Errors (11xxx)

### WAE-11001: Detection Failed
**Beschreibung:** Mobile-Erkennung fehlgeschlagen

**Lösungen:**
1. Update @whiskeysockets/baileys
2. Nutze Desktop-Modus als Fallback
3. Prüfe Mobile-Support Config

---

### WAE-11002: Pairing Failed
**Beschreibung:** Mobile-Pairing fehlgeschlagen

**Lösungen:**
1. Nutze QR-Code statt Pairing-Code
2. Prüfe Telefonnummer-Format
3. Versuche erneut

---

### WAE-11003: Code Invalid
**Beschreibung:** Ungültiger Pairing-Code

**Lösungen:**
1. Generiere neuen Code
2. Prüfe Code-Format
3. Nutze QR-Code

---

### WAE-11004: Not Supported
**Beschreibung:** Mobile-Feature nicht unterstützt

**Lösungen:**
1. Nutze Desktop-Modus
2. Update WAEngine
3. Prüfe Feature-Verfügbarkeit

---

### WAE-11005: Timeout
**Beschreibung:** Mobile-Operation Timeout

**Lösungen:**
1. Erhöhe Timeout
2. Versuche erneut
3. Nutze QR-Code

---

## Recovery Errors (12xxx)

### WAE-12001: Recovery Failed
**Beschreibung:** Wiederherstellung fehlgeschlagen

**Lösungen:**
1. Prüfe Backup-Dateien
2. Nutze manuelles Backup
3. Starte neu mit frischer Session

---

### WAE-12002: Backup Not Found
**Beschreibung:** Backup nicht gefunden

**Lösungen:**
1. Erstelle neues Backup:
   ```javascript
   await client.backupSession();
   ```
2. Prüfe Backup-Ordner
3. Aktiviere Auto-Backup

---

### WAE-12003: Backup Corrupted
**Beschreibung:** Backup beschädigt

**Lösungen:**
1. Nutze älteres Backup
2. Erstelle neue Session
3. Aktiviere mehrere Backups

---

### WAE-12004: Restore Failed
**Beschreibung:** Wiederherstellung fehlgeschlagen

**Lösungen:**
1. Prüfe Backup-Integrität
2. Nutze anderes Backup
3. Erstelle neue Session

---

### WAE-12005: Auto-Backup Failed
**Beschreibung:** Automatisches Backup fehlgeschlagen

**Lösungen:**
1. Prüfe Speicherplatz
2. Prüfe Berechtigungen
3. Nutze manuelles Backup

---

## Database Errors (13xxx)

### WAE-13001: Connection Failed
**Beschreibung:** Datenbank-Verbindung fehlgeschlagen

**Lösungen:**
1. Prüfe Datenbank-Config
2. Starte Datenbank-Server
3. Prüfe Credentials

---

### WAE-13002: Query Failed
**Beschreibung:** Datenbank-Query fehlgeschlagen

**Lösungen:**
1. Prüfe SQL-Syntax
2. Prüfe Tabellen-Struktur
3. Prüfe Berechtigungen

---

### WAE-13003: Migration Failed
**Beschreibung:** Datenbank-Migration fehlgeschlagen

**Lösungen:**
1. Backup erstellen
2. Migration manuell durchführen
3. Rollback durchführen

---

### WAE-13004: Data Corrupted
**Beschreibung:** Daten beschädigt

**Lösungen:**
1. Restore aus Backup
2. Repariere Datenbank
3. Erstelle neue Datenbank

---

### WAE-13005: Timeout
**Beschreibung:** Datenbank-Timeout

**Lösungen:**
1. Erhöhe Timeout
2. Optimiere Queries
3. Prüfe Server-Last

---

## Network Errors (14xxx)

### WAE-14001: DNS Failed
**Beschreibung:** DNS-Auflösung fehlgeschlagen

**Lösungen:**
1. Prüfe DNS-Server
2. Nutze alternative DNS (8.8.8.8)
3. Prüfe Internetverbindung

---

### WAE-14002: Proxy Failed
**Beschreibung:** Proxy-Verbindung fehlgeschlagen

**Lösungen:**
1. Prüfe Proxy-Config
2. Deaktiviere Proxy
3. Nutze anderen Proxy

---

### WAE-14003: SSL Error
**Beschreibung:** SSL/TLS Fehler

**Lösungen:**
1. Update Node.js
2. Prüfe Zertifikate
3. Deaktiviere SSL-Verifizierung (nur für Tests!)

---

### WAE-14004: Rate Limited
**Beschreibung:** Rate Limit erreicht

**Lösungen:**
1. Warte und versuche erneut
2. Reduziere Request-Frequenz
3. Nutze Delay zwischen Requests

---

### WAE-14005: Firewall Blocked
**Beschreibung:** Firewall blockiert Verbindung

**Lösungen:**
1. Konfiguriere Firewall
2. Erlaube WhatsApp Ports
3. Nutze VPN

---

## Security Errors (15xxx)

### WAE-15001: Unauthorized
**Beschreibung:** Nicht autorisiert

**Lösungen:**
1. Prüfe Credentials
2. Erneuere Token
3. Prüfe Berechtigungen

---

### WAE-15002: Token Expired
**Beschreibung:** Token abgelaufen

**Lösungen:**
1. Erneuere Token
2. Login erneut
3. Prüfe Token-Lifetime

---

### WAE-15003: Invalid Token
**Beschreibung:** Ungültiger Token

**Lösungen:**
1. Generiere neuen Token
2. Prüfe Token-Format
3. Prüfe Token-Quelle

---

### WAE-15004: Access Denied
**Beschreibung:** Zugriff verweigert

**Lösungen:**
1. Prüfe Berechtigungen
2. Kontaktiere Admin
3. Prüfe User-Rolle

---

### WAE-15005: Encryption Failed
**Beschreibung:** Verschlüsselung fehlgeschlagen

**Lösungen:**
1. Prüfe Crypto-Module
2. Update Dependencies
3. Prüfe Keys

---

## 🔧 Verwendung im Code

### Error-Code prüfen
```javascript
try {
    await client.connect();
} catch (error) {
    console.log('Error Code:', error.code);
    console.log('Description:', getErrorDescription(error.code));
    console.log('Category:', getErrorCategory(error.code));
}
```

### Custom Error mit Code erstellen
```javascript
import { createError, ERROR_CODES } from './src/error-codes.js';

throw createError(
    ERROR_CODES.MESSAGE.SEND_FAILED,
    'Nachricht konnte nicht gesendet werden',
    { recipient: jid }
);
```

### Error-Handler mit Codes
```javascript
client.on('error', (error) => {
    switch (error.code) {
        case ERROR_CODES.CONNECTION.FAILED:
            console.log('Verbindung fehlgeschlagen - versuche Reconnect');
            break;
        case ERROR_CODES.AUTH.SESSION_CORRUPTED:
            console.log('Session korrupt - lösche auth Ordner');
            break;
        default:
            console.log('Unbekannter Fehler:', error.code);
    }
});
```

### Error-Statistiken abrufen
```javascript
const stats = client.errorHandler.getErrorStats();
console.log('Total Errors:', stats.totalErrors);
console.log('Most Common:', stats.mostCommonError);
console.log('By Code:', stats.errorsByCode);
```

---

## 📞 Support

Bei Fragen oder Problemen:

- **Email:** Liaia@outlook.de
- **GitHub Issues:** https://github.com/neotreydel-lab/waengine/issues
- **Discord:** https://discord.gg/waengine

---

## 📝 Changelog

### v1.7.5
- ✅ Feste Error-Codes für alle Fehlertypen
- ✅ 80+ vordefinierte Error-Codes
- ✅ Deutsche Beschreibungen
- ✅ Automatische Error-Code Erkennung
- ✅ Error-Statistiken und Tracking
- ✅ Vollständige Dokumentation

---

**WAEngine v1.7.5** - Ultra-Robust WhatsApp Bot Framework
