# 🔌 WAEngine Plugin System

Das WAEngine Plugin System ermöglicht es, den Bot mit modularen Plugins zu erweitern. **Plugins sind optional** und werden nur geladen, wenn explizit aufgerufen!

## 📦 Verfügbare Plugins (8 Plugins)

### 💰 Economy System
**Beschreibung:** Vollständiges Wirtschaftssystem mit Coins, Shop und Belohnungen
**Commands:**
- `!balance` - Kontostand anzeigen
- `!daily` - Tägliche Belohnung (100-500 Coins)
- `!work` - Arbeiten gehen (50-200 Coins)
- `!shop` - Shop mit Items anzeigen
- `!buy <id>` - Item kaufen
- `!transfer @user <amount>` - Coins übertragen
- `!leaderboard` - Top 10 reichste User

### 🎮 Games Plugin
**Beschreibung:** Verschiedene Spiele und Unterhaltung
**Commands:**
- `!dice [seiten]` - Würfel werfen (Standard: 6 Seiten)
- `!flip` - Münze werfen
- `!rps <rock/paper/scissors>` - Schere-Stein-Papier
- `!quiz` - Quiz mit zufälligen Fragen
- `!number` - Zahlenraten-Spiel
- `!8ball <frage>` - Magische 8-Ball Antworten

### 🎵 Music Plugin
**Beschreibung:** Musik-Suche und YouTube Integration
**Commands:**
- `!play <song>` - Musik auf YouTube suchen
- `!lyrics <song>` - Songtexte finden
- `!playlist` - Persönliche Playlist verwalten
- `!playlist add <song>` - Song zur Playlist hinzufügen
- `!playlist show` - Playlist anzeigen
- `!trending` - Trending Musik anzeigen

### ✈️ Travel Plugin
**Beschreibung:** Reise-Informationen und Wetter
**Commands:**
- `!weather <stadt>` - Aktuelles Wetter
- `!forecast <stadt>` - 5-Tage Wettervorhersage
- `!flight <von> <nach>` - Flugsuche
- `!hotel <stadt>` - Hotel-Empfehlungen
- `!currency <von> <nach> <betrag>` - Währungsrechner
- `!travel <stadt>` - Reise-Tipps

### 📚 Education Plugin
**Beschreibung:** Bildungs-Tools und Lernhilfen
**Commands:**
- `!wiki <begriff>` - Wikipedia-Artikel suchen
- `!define <wort>` - Wort-Definition
- `!math <ausdruck>` - Mathematische Berechnungen
- `!code <code>` - Code-Erklärungen
- `!learn [thema]` - Lernressourcen
- `!fact` - Zufällige Fakten
- `!study start/stop` - Lernzeit tracken

### 🛡️ Moderation Plugin
**Beschreibung:** Erweiterte Moderation und Auto-Mod
**Commands:**
- `!warn @user [grund]` - User warnen
- `!unwarn @user` - Warnung entfernen
- `!warnings [@user]` - Warnungen anzeigen
- `!kick @user [grund]` - User kicken
- `!automod [on/off]` - Auto-Moderation verwalten
- `!modstats` - Moderations-Statistiken
- `!rules` - Gruppenregeln anzeigen
- `!setrules <regel1> | <regel2>` - Regeln festlegen
- `!purge <anzahl>` - Nachrichten löschen

**Auto-Moderation Features:**
- Spam-Erkennung (5 Nachrichten in 10 Sekunden)
- Verbotene Wörter Filter
- Zu viele Großbuchstaben (>70%)
- Zu viele Emojis (>10)
- Automatische Warnungen und Kicks

### 🎨 Creative Plugin
**Beschreibung:** Kreative Tools für Memes, ASCII-Art und mehr
**Commands:**
- `!meme <nummer> <text>` - Meme mit Templates erstellen
- `!quote` - Inspirierende Zitate
- `!ascii <typ>` - ASCII-Art (heart, star, smile, cat, dog)
- `!textart <text>` - Großer Text-Art
- `!colortext <text> [stil]` - Bunter Text (rainbow, fire, ocean, nature, space)
- `!fact` - Unglaubliche Fakten
- `!joke` - Lustige Witze
- `!story` - Story-Prompt Generator
- `!inspire` - Zufällige Inspiration

### 📊 Analytics Plugin
**Beschreibung:** Detaillierte Statistiken und Analytics
**Commands:**
- `!stats [@user]` - User-Statistiken
- `!mystats` - Eigene Statistiken
- `!groupstats` - Gruppen-Statistiken
- `!globalstats` - Globale Statistiken
- `!topusers [anzahl]` - Top User nach Nachrichten
- `!topgroups [anzahl]` - Top Gruppen
- `!topcommands [anzahl]` - Meist genutzte Commands
- `!heatmap [me/group]` - Aktivitäts-Heatmap
- `!export` - Persönliche Daten exportieren

**Tracking Features:**
- Nachrichten-Anzahl und Zeichen
- Stunden- und Tages-Aktivität
- Command-Nutzung
- Medien-Nachrichten
- Gruppen-Aktivität

## 🚀 Plugin System Features

### Optionales Laden
- Plugins werden nur geladen wenn explizit aufgerufen
- Verwende `client.load.Plugins("plugin-name")` zum Laden
- Ohne Aufruf: KEINE Plugins geladen
- Bessere Performance und Kontrolle
- Plugins sind sofort nach Verbindung verfügbar

### Plugin Manager
```javascript
// Plugin laden
await client.pluginManager.load('economy-system');

// Alle Plugins laden
await client.pluginManager.loadAllPlugins();

// Plugin-Status
const stats = client.pluginManager.getStats();
console.log(`${stats.loaded}/${stats.available} Plugins geladen`);
```

### Storage Integration
Jedes Plugin nutzt das WAEngine Storage System:
```javascript
// Plugin-spezifische Daten speichern
this.client.storage.write.in('economy').set(`${userId}.coins`, 1000);

// Daten lesen
const coins = this.client.storage.read.from('economy').get(`${userId}.coins`) || 0;
```

### Command System
Commands werden automatisch registriert:
```javascript
getCommands() {
    return {
        'balance': this.handleBalance.bind(this),
        'daily': this.handleDaily.bind(this)
    };
}
```

## 📁 Plugin Struktur

```
plugins/
├── economy-system/
│   ├── index.js          # Haupt-Plugin Klasse
│   └── config.json       # Plugin-Konfiguration
├── games-plugin/
│   ├── index.js
│   └── config.json
├── music-plugin/
│   ├── index.js
│   └── config.json
├── travel-plugin/
│   ├── index.js
│   └── config.json
├── education-plugin/
│   ├── index.js
│   └── config.json
├── moderation-plugin/
│   ├── index.js
│   └── config.json
├── creative-plugin/
│   ├── index.js
│   └── config.json
└── analytics-plugin/
    ├── index.js
    └── config.json
```

## 🔧 Plugin Entwicklung

### Plugin Klasse Template
```javascript
export default class MyPlugin {
    constructor(client) {
        this.client = client;
        this.name = 'my-plugin';
        this.version = '1.0.0';
        this.description = 'Mein erstes Plugin';
    }

    getCommands() {
        return {
            'mycommand': this.handleMyCommand.bind(this)
        };
    }

    async handleMyCommand(msg, args) {
        await msg.reply('Hello from my plugin!');
    }
}
```

### Config.json Template
```json
{
  "name": "my-plugin",
  "displayName": "My Plugin",
  "version": "1.0.0",
  "description": "Beschreibung des Plugins",
  "author": "WAEngine",
  "category": "utility",
  "permissions": ["send_messages"],
  "commands": [
    {
      "name": "mycommand",
      "description": "Mein Command",
      "usage": "!mycommand",
      "adminOnly": false
    }
  ],
  "dependencies": [],
  "storage": ["my_data"]
}
```

## 🧪 Testing

Verwende die Test-Datei `plugin-system-test.js`:

```bash
node plugin-system-test.js
```

**Test Commands:**
- `!plugin-test` - Alle Plugin Commands anzeigen
- `!plugins` - Plugin Status
- `!test-economy` - Economy System testen
- `!test-games` - Games Plugin testen
- `!test-creative` - Creative Plugin testen
- `!test-analytics` - Analytics Plugin testen
- `!test-all` - Alle Plugins nacheinander testen

## 📊 Plugin Statistiken

- **Gesamt Commands:** 80+ Commands
- **Storage Files:** Automatisch pro Plugin
- **Auto-Load:** Ja, nach WhatsApp Verbindung
- **Hot-Reload:** Nein (Neustart erforderlich)
- **Dependencies:** Automatisch verwaltet

## 🔒 Sicherheit

- Plugins laufen in isolierten Kontexten
- Storage ist plugin-spezifisch getrennt
- Admin-Commands sind geschützt
- Auto-Moderation verhindert Missbrauch

## 🚀 Verwendung

1. **Bot starten:** `node plugin-system-test.js`
2. **QR Code scannen:** Mit WhatsApp
3. **Plugins werden automatisch geladen**
4. **Commands verwenden:** `!plugin-test` für Übersicht

Alle 8 Plugins sind sofort nach der Verbindung verfügbar und bieten über 80 verschiedene Commands für jeden Anwendungsfall!