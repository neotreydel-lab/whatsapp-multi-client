# 🎫 WAEngine Support Website

Eine vollständige Support-Website mit Ticket-System und Admin-Panel für WAEngine.

## ✨ Features

### 🎯 **Benutzer-Features**
- **Ticket erstellen** - Einfaches Formular für Support-Anfragen
- **Ticket Status prüfen** - Status-Abfrage per ID oder E-Mail
- **FAQ Bereich** - Häufig gestellte Fragen
- **Dokumentation** - Links zu Guides und API-Referenz
- **Schnell-Kontakt** - Direktes Kontaktformular

### 🛡️ **Admin-Features**
- **Dashboard** - Übersicht über alle Tickets und Statistiken
- **Ticket Management** - Tickets bearbeiten, zuweisen, schließen
- **Benutzer-Verwaltung** - Übersicht über alle Benutzer
- **Konversationen** - Direkte Kommunikation mit Benutzern
- **Einstellungen** - E-Mail und Ticket-Konfiguration

### 📱 **Technische Features**
- **Responsive Design** - Funktioniert auf allen Geräten
- **Lokaler Speicher** - Daten werden lokal gespeichert
- **REST API** - Vollständige API für alle Funktionen
- **Echtzeit Updates** - Live-Updates im Admin-Panel
- **Sicherheit** - Admin-Login und Datenschutz

## 🚀 Installation & Start

### 1. Server starten
```bash
cd support-website
node server.js
```

### 2. Website öffnen
```
http://localhost:3000
```

### 3. Admin-Panel
- **URL**: `http://localhost:3000/#admin`
- **Login**: `admin` / `waengine2024`

## 📋 Verwendung

### Als Benutzer

1. **Ticket erstellen**
   - Auf "Ticket erstellen" klicken
   - Formular ausfüllen
   - Ticket wird automatisch erstellt

2. **Ticket Status prüfen**
   - Auf "Ticket Status" klicken
   - Ticket-ID oder E-Mail eingeben
   - Status und Details anzeigen

### Als Admin

1. **Anmelden**
   - Auf "Admin" klicken
   - Benutzername: `admin`
   - Passwort: `waengine2024`

2. **Tickets verwalten**
   - Dashboard zeigt Übersicht
   - Tickets-Tab für Details
   - Auf Ticket klicken für Bearbeitung

3. **Antworten senden**
   - Ticket öffnen
   - Antwort schreiben
   - "Senden" klicken

## 🔧 Konfiguration

### Server-Einstellungen
```javascript
// In server.js anpassen
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
```

### Admin-Login ändern
```javascript
// In js/main.js, Zeile ~XXX
if (username === 'admin' && password === 'waengine2024') {
    // Hier Credentials ändern
}
```

### E-Mail Einstellungen
Im Admin-Panel unter "Einstellungen" → "E-Mail Einstellungen"

## 📁 Datei-Struktur

```
support-website/
├── index.html          # Haupt-Website
├── css/
│   └── style.css       # Styling
├── js/
│   └── main.js         # Frontend-Logik
├── server.js           # Backend-Server
├── package.json        # Node.js Konfiguration
├── data/               # Daten-Speicher (wird erstellt)
│   ├── tickets.json    # Ticket-Daten
│   ├── users.json      # Benutzer-Daten
│   └── settings.json   # Einstellungen
└── README.md           # Diese Datei
```

## 🌐 API Endpoints

### Tickets
- `GET /api/tickets` - Alle Tickets abrufen
- `POST /api/tickets` - Neues Ticket erstellen
- `PUT /api/tickets` - Ticket aktualisieren

### Benutzer
- `GET /api/users` - Alle Benutzer abrufen

### Statistiken
- `GET /api/stats` - Dashboard-Statistiken

### Einstellungen
- `GET /api/settings` - Einstellungen abrufen
- `PUT /api/settings` - Einstellungen aktualisieren

## 🎨 Anpassungen

### Design anpassen
```css
/* In css/style.css */
:root {
    --primary-color: #2563eb;    /* Hauptfarbe */
    --secondary-color: #64748b;  /* Sekundärfarbe */
    /* Weitere Farben... */
}
```

### Ticket-Typen hinzufügen
```javascript
// In js/main.js, getTypeText() Funktion
const typeMap = {
    'bug': 'Bug Report',
    'feature': 'Feature Request',
    'help': 'Hilfe & Support',
    'installation': 'Installation',
    'documentation': 'Dokumentation',
    'custom': 'Eigener Typ',  // Neu hinzufügen
    'other': 'Sonstiges'
};
```

## 🔒 Sicherheit

### Produktions-Setup
1. **HTTPS verwenden**
2. **Starke Passwörter** für Admin-Accounts
3. **Datenbank** statt lokaler Dateien
4. **Rate Limiting** für API-Calls
5. **Input Validation** für alle Formulare

### Empfohlene Verbesserungen
- JWT-Token für Admin-Sessions
- Verschlüsselung für sensible Daten
- Backup-System für Tickets
- E-Mail-Integration für Benachrichtigungen

## 🐛 Troubleshooting

### Server startet nicht
```bash
# Port bereits belegt?
netstat -tulpn | grep :3000

# Node.js Version prüfen
node --version  # Sollte >= 16.0.0 sein
```

### Admin-Login funktioniert nicht
- Credentials prüfen: `admin` / `waengine2024`
- Browser-Cache leeren
- JavaScript-Konsole auf Fehler prüfen

### Tickets werden nicht gespeichert
- Schreibrechte im Ordner prüfen
- `data/` Ordner wird automatisch erstellt
- Server-Logs auf Fehler prüfen

## 📞 Support

Bei Problemen mit der Support-Website:

1. **GitHub Issues** - Für Bugs und Feature-Requests
2. **E-Mail** - support@waengine.com
3. **Discord** - WAEngine Community

## 📄 Lizenz

MIT License - Siehe LICENSE Datei für Details.

---

**Made with ❤️ for WAEngine Community**