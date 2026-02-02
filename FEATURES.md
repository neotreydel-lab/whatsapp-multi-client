# 🚀 WAEngine - Alle Features im Überblick

> Die komplette Feature-Liste der mächtigsten WhatsApp Bot Library mit vollständigem Plugin-System

---

## 📋 Inhaltsverzeichnis

1. [🎯 Drei APIs in einem](#-drei-apis-in-einem)
2. [⚡ EasyBot Features](#-easybot-features)
3. [🔥 Multi-Device System](#-multi-device-system)
4. [💬 Message System](#-message-system)
5. [🎭 Typing Indicator](#-typing-indicator)
6. [👥 Group Management](#-group-management)
7. [🛡️ Permission System](#️-permission-system)
8. [📊 Statistics System](#-statistics-system)
9. [🎯 Command System](#-command-system)
10. [📊 Poll Integration](#-poll-integration)
11. [🎧 Event System](#-event-system)
12. [📱 QR Code System](#-qr-code-system)
13. [🔧 Utility Functions](#-utility-functions)
14. [🔐 Authentication](#-authentication)
15. [💾 Storage System](#-storage-system)
16. [🤖 AI Integration](#-ai-integration)
17. [🌐 HTTP Client](#-http-client)
18. [📅 Scheduler System](#-scheduler-system)
19. [⏰ Waiting System](#-waiting-system)
20. [🎭 Hidetag System](#-hidetag-system)
21. [🎨 Sticker Creation](#-sticker-creation)
22. [🎤 Visual Recording](#-visual-recording)
23. [🔌 Plugin System](#-plugin-system) **NEU!**
24. [🚀 Advanced Features](#-advanced-features) **NEU in v1.7.3!**

---

## 🎯 Drei APIs in einem

### **🟢 EasyBot - Für Anfänger**
```javascript
import { quickBot } from "waengine";

quickBot()
    .when("hello").reply("Hi! 👋")
    .start();
```
**Was es kann:**
- 3-Zeilen Bot Creation
- Action Chaining (jQuery-Style)
- Auto-Responses
- Template System
- Conditional Logic

### **🔵 Advanced API - Für Profis**
```javascript
import { WhatsAppClient } from "waengine";

const client = new WhatsAppClient();
client.setPrefix('!');
client.on('message', async (msg) => {
    if (msg.text === 'hello') {
        await msg.simulateTyping('Hello! How can I help?');
    }
});
await client.connect();
```
**Was es kann:**
- Vollkontrolle über alle Funktionen
- Event-basierte Architektur
- Custom Message Handling
- Advanced Features

### **🟡 Multi-Device - Für Skalierung**
```javascript
import { MultiWhatsAppClient } from "waengine";

const multiClient = new MultiWhatsAppClient({
    maxDevices: 3,
    loadBalancing: 'round-robin'
});

await multiClient.addDevice('bot1');
await multiClient.addDevice('bot2');
await multiClient.connect();
```
**Was es kann:**
- Mehrere WhatsApp Accounts gleichzeitig
- Load Balancing (Round-Robin, Random, Least-Used)
- Automatic Failover
- Health Monitoring

---

## ⚡ EasyBot Features

### **Action Chaining**
```javascript
createBot()
    .when("important")
        .react("⚠️")        // Reaction
        .type(2)            // 2 Sekunden typing
        .reply("Important!")  // Antwort
        .react("✅")        // Weitere Reaction
        .done()             // Zurück zum Bot
```

### **Auto-Responses**
```javascript
bot
    .autoReply("hi", "Hello!")
    .autoReply("bye", "Goodbye!")
```

### **Template System**
```javascript
bot
    .template("greeting", "Hello {name}! Today is {day}")
    .when("welcome").useTemplate("greeting")
```

**Verfügbare Variablen:**
- `{name}` - Sender Name
- `{sender}` - Sender JID
- `{time}` - Aktuelle Zeit
- `{date}` - Aktuelles Datum
- `{datetime}` - Datum + Zeit
- `{day}` - Wochentag
- `{chat}` - "Gruppe" oder "Privat"

### **Conditional Logic**
```javascript
bot
    .if("is group").then("reply Hello group!")
    .if("contains bot").then("react 🤖")
```

### **Multi-Device EasyBot**
```javascript
multiBot(3) // 3 Devices
    .when("test").reply("Multi-device test!")
    .command("status", "📊 Multi-device running!")
    .start();
```

---

## 🔥 Multi-Device System

### **Load Balancing Strategien**
```javascript
// Round-robin (Standard)
multiClient.setLoadBalancingStrategy('round-robin');

// Zufällige Auswahl
multiClient.setLoadBalancingStrategy('random');

// Am wenigsten genutztes Device
multiClient.setLoadBalancingStrategy('least-used');
```

### **Smart Messaging**
```javascript
// Load-balanced Sending
await multiClient.sendMessage(chatId, { text: 'Hello!' });

// Broadcast an alle Devices
await multiClient.broadcast(chatId, { text: 'Broadcast!' });

// Mit Failover (falls ein Device ausfällt)
await multiClient.sendWithFailover(chatId, { text: 'Failover!' });

// Spezifisches Device
await multiClient.sendFromDevice('bot1', chatId, { text: 'From Bot1!' });
```

### **Health Monitoring**
```javascript
// Status abrufen
const status = multiClient.getStatus();
console.log(`${status.activeDevices}/${status.totalDevices} devices active`);

// Health Check
const health = multiClient.getHealthCheck();
console.log(`Health: ${health.healthPercentage}% - ${health.recommendation}`);
```

### **Multi-Device Events**
```javascript
multiClient.on('message', async (msg) => {
    console.log(`Message from device: ${msg.deviceId}`);
    
    // Reply vom gleichen Device
    await msg.replyFromSameDevice('Same device reply');
    
    // Reply via Load Balancing
    await msg.replyFromAnyDevice('Load balanced reply');
    
    // Broadcast Reply
    await msg.broadcastReply('Broadcast reply');
});
```

---

## 💬 Message System

### **Basic Messaging**
```javascript
// Einfache Antwort
await msg.reply("Hello!")

// Mit Mentions
await msg.reply("Hello @user!", [userJid])
```

### **Media Messages**
```javascript
// Bilder
await msg.sendImage("path/image.jpg", "Caption", [mentions])

// Videos
await msg.sendVideo("path/video.mp4", "Caption", [mentions])

// Audio
await msg.sendAudio("path/audio.mp3")

// Sticker
await msg.sendSticker("path/sticker.webp")

// Dokumente
await msg.sendDocument("path/file.pdf", "filename.pdf", [mentions])
```

### **Special Messages**
```javascript
// Location
await msg.sendLocation(latitude, longitude)

// Contact
await msg.sendContact(vcard, "Display Name")

// Emoji Reaction
await msg.react("😂")

// Message löschen
await msg.delete()
```

### **Message Properties**
```javascript
msg.id          // Message ID
msg.from        // Sender JID
msg.text        // Message Text
msg.type        // text, image, video, audio, etc.
msg.isGroup     // true/false
msg.timestamp   // Unix Timestamp
msg.raw         // Raw Baileys Object
```

---

## 🎭 Typing Indicator

### **Manual Control**
```javascript
// Start/Stop Typing
await msg.visualWrite(true)           // Typing AN
await msg.visualWrite(false)          // Typing AUS

// Typing für bestimmte Zeit
await msg.typeFor(3000)               // 3 Sekunden typing
```

### **Typing + Reply Combined**
```javascript
// Feste Zeit
await msg.typeAndReply("Message", 2000)  // 2 Sekunden typing

// Realistisches Typing
await msg.simulateTyping("Long text...", {
    typingSpeed: 50,        // ms pro Zeichen
    minTypingTime: 1000,    // Minimum Zeit
    maxTypingTime: 5000,    // Maximum Zeit
    mentions: [userJid]     // Mit Mentions
})
```

### **Convenience Methods**
```javascript
await msg.quickType("Text")     // 1 Sekunde
await msg.normalType("Text")    // 2 Sekunden
await msg.slowType("Text")      // 4 Sekunden
await msg.realisticType("Text") // Basierend auf Textlänge
```

---

## 👥 Group Management

### **Group Information**
```javascript
// Group Metadata
const metadata = await client.get.GroupMetadata(groupId)

// Alle Teilnehmer
const participants = await client.get.GroupParticipants(groupId)

// Nur Admins
const admins = await client.get.GroupAdmins(groupId)
```

### **User Management**
```javascript
// User hinzufügen
await client.add.user(groupId, [userJid], [mentions])

// User entfernen
await client.kick.user(groupId, [userJid], [mentions])

// Zu Admin machen
await client.promote.user(groupId, [userJid], [mentions])

// Admin entfernen
await client.demote.user(groupId, [userJid], [mentions])
```

### **Mention System**
```javascript
// Einzelne Person erwähnen
await msg.replyWithMention("Hello @user!", userJid)

// Alle in Gruppe erwähnen
await msg.mentionAll("Hello everyone!")

// Mentions aus Message abrufen
const mentions = msg.getMentions()

// Prüfen ob erwähnt
const isMentioned = msg.isMentioned(userJid)
```

---

## 🛡️ Permission System

### **Permission Checks**
```javascript
// Admin Checks
const isAdmin = await msg.isAdmin()        // Ist Sender Admin?
const isBotAdmin = await msg.isBotAdmin()  // Ist Bot Admin?
const isOwner = await msg.isOwner()        // Ist Sender Owner?

// Chat Type Checks
const isGroup = msg.isGroup               // Ist Gruppe?
const isPrivate = msg.isPrivate()         // Ist privater Chat?

// Sender Info
const senderJid = msg.getSender()         // Sender JID
```

### **Usage in Commands**
```javascript
client.addCommand('kick', async (msg, args) => {
    if (!msg.isGroup) {
        return msg.reply('❌ Nur in Gruppen!')
    }
    
    if (!(await msg.isAdmin())) {
        return msg.reply('❌ Nur für Admins!')
    }
    
    if (!(await msg.isBotAdmin())) {
        return msg.reply('❌ Bot braucht Admin-Rechte!')
    }
    
    // Kick Logic...
})
```

---

## 📊 Statistics System

### **Message Statistics**
```javascript
// Message Counts
const stats = await msg.stats.getMessageCount()
// Returns: { total: 1234, today: 56, thisWeek: 234 }

// User Activity
const activity = await msg.stats.getUserActivity(userId)
// Returns: { messagesCount: 123, lastSeen: Date, isActive: true }

// Group Stats (nur Gruppen)
const groupStats = await msg.stats.getGroupStats()
// Returns: { groupName, totalMembers, admins, created, description }

// Top aktive User
const topUsers = await msg.stats.getMostActiveUsers(5)

// Messages nach Type
const messageTypes = await msg.stats.getMessagesByType()
// Returns: { text: 500, image: 100, video: 50, ... }
```

---

## 🎯 Command System

### **Prefix Setup**
```javascript
// Global Prefix (Fallback)
const prefix = "!"
client.setPrefix(prefix)

// Chat-spezifische Prefixes (NEU in v1.0.7!)
client.setChatPrefix(chatId, "#")  // Für spezifischen Chat
client.getChatPrefix(chatId)       // Prefix abrufen
client.removeChatPrefix(chatId)    // Prefix entfernen

// Commands registrieren
client.addCommand('help', async (msg, args) => {
    await msg.reply('Help text')
})

client.addCommand('ping', async (msg, args) => {
    await msg.reply('Pong! 🏓')
})
```

### **Chat-spezifische Prefixes (v1.0.7)**
```javascript
// Setprefix Command (Admin only)
client.addCommand('setprefix', async (msg, args) => {
    if (msg.isGroup && !(await msg.isAdmin())) {
        return msg.reply('❌ Nur Admins können den Prefix ändern!');
    }
    
    const newPrefix = args[0];
    client.setChatPrefix(msg.from, newPrefix);
    await msg.reply(`✅ Prefix geändert zu: "${newPrefix}"`);
});

// Prefix Statistics
const stats = client.getPrefixStats();
const allPrefixes = client.getAllPrefixes();
```

**Features:**
- ✅ **Persistent Storage** - Automatisch gespeichert in `./data/prefixes.json`
- ✅ **Admin-only Changes** - Nur Admins können Prefixes in Gruppen ändern
- ✅ **Validierung** - Max 5 Zeichen, keine Leerzeichen
- ✅ **Statistics** - Übersicht über alle verwendeten Prefixes
- ✅ **Fallback System** - Global Prefix als Standard

### **Command Properties**
```javascript
// In Message Events
if (msg.isCommand) {
    console.log(msg.command)      // "help"
    console.log(msg.args)         // ["arg1", "arg2"]
    console.log(msg.commandText)  // "help arg1 arg2"
}
```

### **Command Management**
```javascript
// Commands auflisten
const commands = client.getCommands()

// Command entfernen
client.removeCommand('help')

// Prefix abrufen
const currentPrefix = client.getPrefix()
```

---

## 📊 Poll Integration

### **Polls erstellen**
```javascript
// Einfache Poll
await msg.sendPoll('Favorite pizza?', ['Margherita', 'Pepperoni', 'Hawaiian'])

// Multi-Selection Poll
await msg.sendMultiPoll('Which colors?', ['Red', 'Blue', 'Green'], 2)
```

### **Fallback System**
Falls native Polls nicht funktionieren, verwendet die Library automatisch Emoji-Fallback:
```
📊 **Favorite pizza?**

1️⃣ Margherita
2️⃣ Pepperoni  
3️⃣ Hawaiian

_React with the corresponding emoji!_
```

---

## 🎧 Event System

### **Event Registration**
```javascript
// Message Events
client.on('message', (msg) => {
    console.log(`Message from ${msg.from}: ${msg.text}`)
})

// Command Events
client.on('command', (msg) => {
    console.log(`Command: ${msg.command}`)
})

// Connection Events
client.on('connected', () => {
    console.log('Connected!')
})

client.on('disconnected', (data) => {
    console.log('Disconnected:', data.reason)
})

// Group Events
client.on('group.participants.update', (update) => {
    console.log('Group changed:', update)
})

// Presence Events
client.on('presence.update', (update) => {
    console.log('Status changed:', update)
})
```

### **Event Management**
```javascript
// Event Handler entfernen
client.off('message', handler)

// Custom Event emittieren
client.emit('custom-event', data)
```

---

## 📱 QR Code System

### **QR Code Generation**
```javascript
import { generateQRCode } from "waengine"

// QR Code generieren
await generateQRCode()

// QR Code mit Daten
await generateQRCode(qrData)

// Browser schließen
await closeBrowser()
```

### **Features**
- ✅ **Microsoft Edge Integration** - Automatisches Öffnen
- ✅ **Terminal Fallback** - QR im Terminal falls Browser fehlschlägt
- ✅ **Auto-Close** - Browser schließt automatisch nach Login

---

## 🔧 Utility Functions

### **Connection Management**
```javascript
// Verbinden
await client.connect()

// Trennen
await client.disconnect()

// Status abrufen
const state = client.getConnectionState()
// Returns: { isConnected: true, socket: true }
```

### **Presence Management**
```javascript
// Global Presence
await client.setOnline()
await client.setOffline()
await client.setTyping(chatId)
await client.setRecording(chatId)
await client.setPaused(chatId)
```

### **Message Type Detection**
```javascript
const type = client.getMessageType(message)
// Returns: text, image, video, audio, document, sticker, location, contact, unknown
```

---

## 💾 Storage System

### **Einfache Storage API**
```javascript
// Schreiben
write.in("datei").data({name: "Lia", age: 25})
write.in("datei").set("key", "value")
write.in("datei").push("neuer eintrag")
write.in("datei").increment("counter", 1)

// Lesen
read.from("datei").all()
read.from("datei").get("key")
read.from("datei").keys()
read.from("datei").exists()

// Löschen
delete.from("datei").all()
delete.from("datei").key("key")
```

### **In Messages verfügbar**
```javascript
client.on('message', async (msg) => {
    // Direkt in Messages verwenden!
    msg.write.in("users").set(msg.getSender(), "active");
    
    const userData = msg.read.from("users").get(msg.getSender());
    
    msg.delete.from("temp").key("old_data");
});
```

### **Storage Features**
- ✅ **Automatische JSON-Dateien** - Kein kompliziertes File-Handling
- ✅ **Nested Keys** - `"user.settings.theme"`
- ✅ **Array Support** - Push, Pop, Length
- ✅ **Increment/Decrement** - Counter ohne Lesen/Schreiben
- ✅ **Cache System** - Schneller Zugriff
- ✅ **Backup System** - Automatische Backups
- ✅ **Statistics** - File-Größen, Counts, etc.

### **Beispiel-Anwendungen**
```javascript
// User-Daten speichern
msg.write.in("users").set(`${userId}.coins`, 100);

// Counter System
msg.write.in("stats").increment("totalMessages", 1);

// Todo-Liste
msg.write.in("todos").push({
    id: Date.now(),
    task: "Bot fertigstellen",
    user: userId
});

// Warn-System
msg.write.in("warnings").push(warnData);
msg.write.in("warn-counts").increment(userId, 1);
```

---

## 🤖 AI Integration

### **Chat Completion**
```javascript
// Einfacher AI Chat
const answer = await client.ai.chat("Erkläre mir JavaScript");

// Mit Optionen
const response = await client.ai.chat("Schreibe ein Gedicht", {
    model: 'gpt-4',
    maxTokens: 300,
    temperature: 0.8,
    systemPrompt: 'Du bist ein kreativer Dichter'
});
```

### **Smart Responses**
```javascript
// Intelligente Antworten basierend auf Kontext
const reply = await client.ai.smartReply(msg.text, {
    isGroup: msg.isGroup,
    userName: msg.getSender().split('@')[0]
});

await msg.reply(reply);
```

### **Text Analysis**
```javascript
// Nachricht analysieren
const analysis = await client.ai.analyzeMessage(msg.text);
// Returns: { sentiment, language, category, toxicity, confidence }

if (analysis.toxicity === 'high') {
    await msg.reply('⚠️ Bitte achte auf deine Sprache!');
}
```

### **Content Moderation**
```javascript
// Automatische Moderation
const moderation = await client.ai.moderateContent(msg.text);

if (moderation.flagged) {
    await msg.delete();
    await msg.reply('❌ Nachricht wurde wegen unangemessenen Inhalts entfernt.');
}
```

### **Translation**
```javascript
// Text übersetzen
const translated = await client.ai.translate("Hello World", "de");
// → "Hallo Welt"

// In Commands verwenden
client.addCommand('translate', async (msg, args) => {
    const [lang, ...text] = args;
    const translation = await client.ai.translate(text.join(' '), lang);
    await msg.reply(`🌍 **Übersetzung:** ${translation}`);
});
```

### **Weitere AI Features**
```javascript
// Text zusammenfassen
const summary = await client.ai.summarize(longText, 100);

// Fragen beantworten
const answer = await client.ai.answerQuestion("Was ist Node.js?");

// Kreativer Text
const story = await client.ai.generateText("Schreibe eine Geschichte über Roboter", "creative");
```

---

## 🌐 HTTP Client

### **Basic HTTP Methods**
```javascript
// GET Request
const data = await client.http.get('https://api.example.com/data');

// POST Request
const result = await client.http.post('https://api.example.com/create', {
    name: 'Test',
    value: 123
});

// Mit Headers und Optionen
const response = await client.http.get('https://api.example.com/secure', {
    headers: { 'Authorization': 'Bearer token' },
    timeout: 5000
});
```

### **Weather API**
```javascript
// Wetter abrufen
const weather = await client.http.getWeather("Berlin");

// Returns:
// {
//   city: "Berlin",
//   country: "DE", 
//   temperature: 15,
//   description: "Bewölkt",
//   humidity: 65,
//   windSpeed: 3.2
// }

// In Commands verwenden
client.addCommand('wetter', async (msg, args) => {
    const city = args.join(' ');
    const weather = await client.http.getWeather(city);
    
    await msg.reply(`🌤️ **${weather.city}**: ${weather.temperature}°C, ${weather.description}`);
});
```

### **News API**
```javascript
// Aktuelle News
const articles = await client.http.getNews('technology');

// Returns Array:
// [
//   {
//     title: "News Titel",
//     description: "Beschreibung...",
//     url: "https://...",
//     source: "Quelle",
//     publishedAt: "31.1.2024"
//   }
// ]
```

### **Crypto Prices**
```javascript
// Kryptowährung-Preise
const price = await client.http.getCryptoPrice('bitcoin');

// Returns:
// {
//   symbol: "bitcoin",
//   priceEUR: 35420.50,
//   priceUSD: 42150.30,
//   change24h: "+2.45"
// }
```

### **URL Shortener**
```javascript
// URL kürzen
const short = await client.http.shortenUrl('https://very-long-url.com');

// Returns:
// {
//   shortUrl: "https://is.gd/abc123",
//   longUrl: "https://very-long-url.com",
//   service: "is.gd"
// }
```

### **Weitere HTTP Features**
```javascript
// QR Code generieren
const qr = await client.http.generateQRCode("Hello World");

// Random Fact
const fact = await client.http.getRandomFact();

// Random Joke
const joke = await client.http.getRandomJoke();

// IP Information
const ipInfo = await client.http.getIPInfo("8.8.8.8");
```

---

## 📅 Scheduler System

### **Cron Scheduling**
```javascript
// Cron-basierte Jobs
const jobId = client.scheduler.schedule(
    '0 9 * * 1-5',  // Werktags um 9:00
    chatId,
    'Guten Morgen! Arbeitszeit! 💪'
);

// Mit Optionen
client.scheduler.schedule('0 18 * * *', chatId, 'Feierabend! 🎉', {
    timezone: 'Europe/Berlin',
    id: 'daily-reminder'
});
```

### **One-Time Scheduling**
```javascript
// Einmalige Nachricht
const reminderDate = new Date('2024-12-31 23:59:00');
client.scheduler.scheduleOnce(
    reminderDate,
    chatId,
    'Happy New Year! 🎉'
);

// Erinnerung in X Minuten
const futureDate = new Date(Date.now() + 30 * 60 * 1000); // 30 Min
client.scheduler.scheduleOnce(futureDate, chatId, 'Erinnerung!');
```

### **Convenience Methods**
```javascript
// Tägliche Nachricht
client.scheduler.daily('09:00', chatId, 'Guten Morgen! ☀️');

// Wöchentliche Nachricht
client.scheduler.weekly('monday', '18:00', chatId, 'Wochenstart! 💪');

// Monatliche Nachricht
client.scheduler.monthly(1, '12:00', chatId, 'Neuer Monat! 📅');
```

### **Template Variables**
```javascript
// Nachrichten mit Variablen
client.scheduler.daily('09:00', chatId, 'Guten Morgen! Heute ist {day}, {date} um {time}');

// Verfügbare Variablen:
// {time} - Aktuelle Zeit
// {date} - Aktuelles Datum  
// {datetime} - Datum + Zeit
// {day} - Wochentag
// {timestamp} - Unix Timestamp
```

### **Job Management**
```javascript
// Job entfernen
client.scheduler.removeJob(jobId);

// Job pausieren/fortsetzen
client.scheduler.pauseJob(jobId);
client.scheduler.resumeJob(jobId);

// Alle Jobs auflisten
const jobs = client.scheduler.listJobs();

// Statistiken
const stats = client.scheduler.getStats();
// Returns: { activeJobs, totalJobs, cronJobs, onceJobs, totalExecuted }
```

### **Persistent Storage**
- ✅ **Auto-Save** - Jobs werden automatisch gespeichert
- ✅ **Auto-Restore** - Jobs werden beim Neustart wiederhergestellt
- ✅ **Cleanup** - Abgelaufene Jobs werden automatisch entfernt

---

## ⏰ Waiting System

### **Die coole API die du wolltest!**
```javascript
// In Messages verwenden
await msg.waiting.after.message(2000); // 2 Sekunden warten
await msg.reply("Nach 2 Sekunden!");

// In Commands
client.addCommand('demo', async (msg) => {
    await msg.reply('Start...');
    await msg.waiting.after.message(3000); // 3 Sekunden warten
    await msg.reply('Nach 3 Sekunden!');
    await msg.waiting.after.message(1000); // 1 Sekunde warten
    await msg.reply('Fertig! 🎉');
});
```

### **Realistische Bot-Interaktionen**
```javascript
client.addCommand('story', async (msg) => {
    await msg.reply('📖 Ich erzähle dir eine Geschichte...');
    
    await msg.waiting.after.message(2000);
    await msg.reply('Es war einmal ein Roboter...');
    
    await msg.waiting.after.message(3000);
    await msg.reply('Der lernte, wie man WhatsApp Bots programmiert...');
    
    await msg.waiting.after.message(2500);
    await msg.reply('Und sie lebten glücklich bis ans Ende ihrer Tage! 🤖✨');
});
```

### **Mit Typing Indicator kombinieren**
```javascript
client.addCommand('think', async (msg) => {
    await msg.visualWrite(true); // Typing an
    await msg.waiting.after.message(3000); // 3 Sekunden "denken"
    await msg.visualWrite(false); // Typing aus
    
    await msg.waiting.after.message(500); // Kurze Pause
    await msg.reply('💡 Ich habe eine Idee!');
});
```

### **Flexible Zeitsteuerung**
```javascript
// Verschiedene Wartezeiten
await msg.waiting.after.message(500);   // 0.5 Sekunden
await msg.waiting.after.message(1000);  // 1 Sekunde  
await msg.waiting.after.message(5000);  // 5 Sekunden
await msg.waiting.after.message(30000); // 30 Sekunden

// Dynamische Wartezeiten
const waitTime = Math.random() * 3000 + 1000; // 1-4 Sekunden
await msg.waiting.after.message(waitTime);
```

### **Perfekt für:**
- ✅ **Realistische Bot-Gespräche** - Menschenähnliche Pausen
- ✅ **Spannungsaufbau** - Dramatische Pausen in Geschichten
- ✅ **API-Wartezeiten** - Zeit für externe Requests
- ✅ **User Experience** - Natürliche Gesprächsrhythmen
- ✅ **Rate Limiting** - Vermeidung von Spam

### **Persistent Authentication**
- ✅ **One-time QR Scan** → Immer auto-connect
- ✅ **Microsoft Edge Integration** - QR Code im Browser
- ✅ **Terminal Fallback** - QR Code im Terminal
- ✅ **Auto-Reconnect** - Automatische Wiederverbindung

```javascript
const client = new WhatsAppClient({
    authDir: "./auth",        // Auth Data Storage
    printQR: false,          // QR im Browser (true = Terminal)
    logLevel: "silent"       // Log Level
});
```

### **Session Management**
```javascript
// Session Status
const status = await client.getSessionStatus()

// Session Validierung
const validation = await client.validateSession()

// Session bereinigen
await client.cleanupSession()

// Session reparieren
await client.repairSession()

// Session Backup
await client.backupSession()

// Logout mit Auto-Cleanup
await client.logout()
```

### **Beispiel für einen Bot**
```javascript
import { WhatsAppClient } from "waengine";

const client = new WhatsAppClient({
    printQR: true, // Sauberer Terminal QR
    logLevel: "silent" // Keine Baileys-Logs
});

client.setPrefix("/");
client.addCommand('ping', async (msg) => {
    await msg.react("🏓")
    await msg.reply('🏓 Pong!');
});

await client.connect();
// ✅ Verbunden! Sende Nachrichten zum Testen...
```
---

## 🎮 Verfügbare Test Commands

- **`!help`** - Alle Commands anzeigen
- **`!ping`** - Pong Response  
- **`!stats`** - Statistiken anzeigen
- **`!kick @user`** - User kicken (nur Admin)
- **`!debug`** - Debug Informationen
- **`!poll "Question" "Opt1" "Opt2"`** - Poll erstellen
- **`!demo`** - Typing Demo
- **`!customtype 3000 "Text"`** - Custom Typing
- **`!slowtype "Text"`** - Slow Typing

---

## 🔥 Feature Count: **125+ Funktionen!**

- **Message Functions:** 15+
- **Group Functions:** 8+  
- **Permission Functions:** 6+
- **Statistics Functions:** 5+
- **Typing Functions:** 8+
- **Command System:** 15+ ⬆️ (NEU: Chat-spezifische Prefixes)
- **Event System:** 8+
- **QR Functions:** 3+
- **Utility Functions:** 15+
- **Multi-Device System:** 20+
- **🆕 EasyBot System:** 25+
- **🆕 Prefix Management:** 5+ (NEU in v1.0.7)

---

## 🚀 Warum WAEngine wählen?

### **🎯 Drei APIs in einem**
- **EasyBot** - 3-Zeilen Bot Creation für Anfänger
- **Advanced** - Vollkontrolle für Profis  
- **Multi-Device** - Skalierung mit mehreren Accounts

### **🔥 Einzigartige Features**
- **Multi-Device Load Balancing** - Industry First!
- **Action Chaining** - jQuery-Style Bot Building
- **Realistic Typing** - Menschenähnliche Interaktionen
- **Edge QR Integration** - Nahtlose Authentifizierung
- **Template System** - Dynamische Inhalte mit Variablen

### **💪 Production Ready**
- **Persistent Auth** - Einmalige Einrichtung
- **Auto Reconnection** - Behandelt Verbindungsabbrüche
- **Health Monitoring** - Device Status verfolgen
- **Error Handling** - Graceful Failure Recovery
- **TypeScript Support** - Vollständige Type Definitions

### **📈 Skalierbare Architektur**
- **Load Balancing** - Message Load verteilen
- **Failover System** - Automatisches Device Switching  
- **Rate Limit Bypass** - Multiple Account Limits
- **Plugin Ready** - Erweiterbar für v2.0

---

*Made with ❤️ for WhatsApp Automation*

**Die mächtigste WhatsApp Bot Library - von 3-Zeilen-Bots bis zu Enterprise Multi-Device Systemen!**

---

## 🔐 Authentication

### **Persistent Authentication**
- ✅ **One-time QR Scan** → Immer auto-connect
- ✅ **Microsoft Edge Integration** - QR Code im Browser
- ✅ **Terminal Fallback** - QR Code im Terminal
- ✅ **Auto-Reconnect** - Automatische Wiederverbindung

```javascript
const client = new WhatsAppClient({
    authDir: "./auth",        // Auth Data Storage
    printQR: false,          // QR im Browser (true = Terminal)
    logLevel: "silent"       // Log Level
});
```

### **Session Management**
```javascript
// Session Status
const status = await client.getSessionStatus();

// Session Validierung
const validation = await client.validateSession();

// Session bereinigen
await client.cleanupSession();

// Session reparieren
await client.repairSession();

// Session Backup
await client.backupSession();

// Logout mit Auto-Cleanup
await client.logout();
```

---

## 💾 Storage System

### **Einfache Storage API**
```javascript
// Schreiben
write.in("datei").data({name: "Lia", age: 25})
write.in("datei").set("key", "value")
write.in("datei").push("neuer eintrag")
write.in("datei").increment("counter", 1)

// Lesen
read.from("datei").all()
read.from("datei").get("key")
read.from("datei").keys()
read.from("datei").exists()

// Löschen
delete.from("datei").all()
delete.from("datei").key("key")
```

### **In Messages verfügbar**
```javascript
client.on('message', async (msg) => {
    // Direkt in Messages verwenden!
    msg.write.in("users").set(msg.getSender(), "active");
    
    const userData = msg.read.from("users").get(msg.getSender());
    
    msg.delete.from("temp").key("old_data");
});
```

### **Storage Features**
- ✅ **Automatische JSON-Dateien** - Kein kompliziertes File-Handling
- ✅ **Nested Keys** - `"user.settings.theme"`
- ✅ **Array Support** - Push, Pop, Length
- ✅ **Increment/Decrement** - Counter ohne Lesen/Schreiben
- ✅ **Cache System** - Schneller Zugriff
- ✅ **Backup System** - Automatische Backups
- ✅ **Statistics** - File-Größen, Counts, etc.

### **Beispiel-Anwendungen**
```javascript
// User-Daten speichern
msg.write.in("users").set(`${userId}.coins`, 100);

// Counter System
msg.write.in("stats").increment("totalMessages", 1);

// Todo-Liste
msg.write.in("todos").push({
    id: Date.now(),
    task: "Bot fertigstellen",
    user: userId
});

// Warn-System
msg.write.in("warnings").push(warnData);
msg.write.in("warn-counts").increment(userId, 1);
```

---

## 🤖 AI Integration

### **Chat Completion**
```javascript
// Einfacher AI Chat
const answer = await client.ai.chat("Erkläre mir JavaScript");

// Mit Optionen
const response = await client.ai.chat("Schreibe ein Gedicht", {
    model: 'gpt-4',
    maxTokens: 300,
    temperature: 0.8,
    systemPrompt: 'Du bist ein kreativer Dichter'
});
```

### **Smart Responses**
```javascript
// Intelligente Antworten basierend auf Kontext
const reply = await client.ai.smartReply(msg.text, {
    isGroup: msg.isGroup,
    userName: msg.getSender().split('@')[0]
});

await msg.reply(reply);
```

### **Text Analysis**
```javascript
// Nachricht analysieren
const analysis = await client.ai.analyzeMessage(msg.text);
// Returns: { sentiment, language, category, toxicity, confidence }

if (analysis.toxicity === 'high') {
    await msg.reply('⚠️ Bitte achte auf deine Sprache!');
}
```

### **Content Moderation**
```javascript
// Automatische Moderation
const moderation = await client.ai.moderateContent(msg.text);

if (moderation.flagged) {
    await msg.delete();
    await msg.reply('❌ Nachricht wurde wegen unangemessenen Inhalts entfernt.');
}
```

### **Translation**
```javascript
// Text übersetzen
const translated = await client.ai.translate("Hello World", "de");
// → "Hallo Welt"

// In Commands verwenden
client.addCommand('translate', async (msg, args) => {
    const [lang, ...text] = args;
    const translation = await client.ai.translate(text.join(' '), lang);
    await msg.reply(`🌍 **Übersetzung:** ${translation}`);
});
```

### **Weitere AI Features**
```javascript
// Text zusammenfassen
const summary = await client.ai.summarize(longText, 100);

// Fragen beantworten
const answer = await client.ai.answerQuestion("Was ist Node.js?");

// Kreativer Text
const story = await client.ai.generateText("Schreibe eine Geschichte über Roboter", "creative");
```

---

## 🌐 HTTP Client

### **Basic HTTP Methods**
```javascript
// GET Request
const data = await client.http.get('https://api.example.com/data');

// POST Request
const result = await client.http.post('https://api.example.com/create', {
    name: 'Test',
    value: 123
});

// Mit Headers und Optionen
const response = await client.http.get('https://api.example.com/secure', {
    headers: { 'Authorization': 'Bearer token' },
    timeout: 5000
});
```

### **Weather API**
```javascript
// Wetter abrufen
const weather = await client.http.getWeather("Berlin");

// Returns:
// {
//   city: "Berlin",
//   country: "DE", 
//   temperature: 15,
//   description: "Bewölkt",
//   humidity: 65,
//   windSpeed: 3.2
// }

// In Commands verwenden
client.addCommand('wetter', async (msg, args) => {
    const city = args.join(' ');
    const weather = await client.http.getWeather(city);
    
    await msg.reply(`🌤️ **${weather.city}**: ${weather.temperature}°C, ${weather.description}`);
});
```

### **News API**
```javascript
// Aktuelle News
const articles = await client.http.getNews('technology');

// Returns Array:
// [
//   {
//     title: "News Titel",
//     description: "Beschreibung...",
//     url: "https://...",
//     source: "Quelle",
//     publishedAt: "31.1.2024"
//   }
// ]
```

### **Crypto Prices**
```javascript
// Kryptowährung-Preise
const price = await client.http.getCryptoPrice('bitcoin');

// Returns:
// {
//   symbol: "bitcoin",
//   priceEUR: 35420.50,
//   priceUSD: 42150.30,
//   change24h: "+2.45"
// }
```

### **URL Shortener**
```javascript
// URL kürzen
const short = await client.http.shortenUrl('https://very-long-url.com');

// Returns:
// {
//   shortUrl: "https://is.gd/abc123",
//   longUrl: "https://very-long-url.com",
//   service: "is.gd"
// }
```

### **Weitere HTTP Features**
```javascript
// QR Code generieren
const qr = await client.http.generateQRCode("Hello World");

// Random Fact
const fact = await client.http.getRandomFact();

// Random Joke
const joke = await client.http.getRandomJoke();

// IP Information
const ipInfo = await client.http.getIPInfo("8.8.8.8");
```

---

## 📅 Scheduler System

### **Cron Scheduling**
```javascript
// Cron-basierte Jobs
const jobId = client.scheduler.schedule(
    '0 9 * * 1-5',  // Werktags um 9:00
    chatId,
    'Guten Morgen! Arbeitszeit! 💪'
);

// Mit Optionen
client.scheduler.schedule('0 18 * * *', chatId, 'Feierabend! 🎉', {
    timezone: 'Europe/Berlin',
    id: 'daily-reminder'
});
```

### **One-Time Scheduling**
```javascript
// Einmalige Nachricht
const reminderDate = new Date('2024-12-31 23:59:00');
client.scheduler.scheduleOnce(
    reminderDate,
    chatId,
    'Happy New Year! 🎉'
);

// Erinnerung in X Minuten
const futureDate = new Date(Date.now() + 30 * 60 * 1000); // 30 Min
client.scheduler.scheduleOnce(futureDate, chatId, 'Erinnerung!');
```

### **Convenience Methods**
```javascript
// Tägliche Nachricht
client.scheduler.daily('09:00', chatId, 'Guten Morgen! ☀️');

// Wöchentliche Nachricht
client.scheduler.weekly('monday', '18:00', chatId, 'Wochenstart! 💪');

// Monatliche Nachricht
client.scheduler.monthly(1, '12:00', chatId, 'Neuer Monat! 📅');
```

### **Template Variables**
```javascript
// Nachrichten mit Variablen
client.scheduler.daily('09:00', chatId, 'Guten Morgen! Heute ist {day}, {date} um {time}');

// Verfügbare Variablen:
// {time} - Aktuelle Zeit
// {date} - Aktuelles Datum  
// {datetime} - Datum + Zeit
// {day} - Wochentag
// {timestamp} - Unix Timestamp
```

### **Job Management**
```javascript
// Job entfernen
client.scheduler.removeJob(jobId);

// Job pausieren/fortsetzen
client.scheduler.pauseJob(jobId);
client.scheduler.resumeJob(jobId);

// Alle Jobs auflisten
const jobs = client.scheduler.listJobs();

// Statistiken
const stats = client.scheduler.getStats();
// Returns: { activeJobs, totalJobs, cronJobs, onceJobs, totalExecuted }
```

### **Persistent Storage**
- ✅ **Auto-Save** - Jobs werden automatisch gespeichert
- ✅ **Auto-Restore** - Jobs werden beim Neustart wiederhergestellt
- ✅ **Cleanup** - Abgelaufene Jobs werden automatisch entfernt

---

## ⏰ Waiting System

### **Die coole API die du wolltest!**
```javascript
// In Messages verwenden
await msg.waiting.after.message(2000); // 2 Sekunden warten
await msg.reply("Nach 2 Sekunden!");

// In Commands
client.addCommand('demo', async (msg) => {
    await msg.reply('Start...');
    await msg.waiting.after.message(3000); // 3 Sekunden warten
    await msg.reply('Nach 3 Sekunden!');
    await msg.waiting.after.message(1000); // 1 Sekunde warten
    await msg.reply('Fertig! 🎉');
});
```

### **Realistische Bot-Interaktionen**
```javascript
client.addCommand('story', async (msg) => {
    await msg.reply('📖 Ich erzähle dir eine Geschichte...');
    
    await msg.waiting.after.message(2000);
    await msg.reply('Es war einmal ein Roboter...');
    
    await msg.waiting.after.message(3000);
    await msg.reply('Der lernte, wie man WhatsApp Bots programmiert...');
    
    await msg.waiting.after.message(2500);
    await msg.reply('Und sie lebten glücklich bis ans Ende ihrer Tage! 🤖✨');
});
```

### **Mit Typing Indicator kombinieren**
```javascript
client.addCommand('think', async (msg) => {
    await msg.visualWrite(true); // Typing an
    await msg.waiting.after.message(3000); // 3 Sekunden "denken"
    await msg.visualWrite(false); // Typing aus
    
    await msg.waiting.after.message(500); // Kurze Pause
    await msg.reply('💡 Ich habe eine Idee!');
});
```

### **Flexible Zeitsteuerung**
```javascript
// Verschiedene Wartezeiten
await msg.waiting.after.message(500);   // 0.5 Sekunden
await msg.waiting.after.message(1000);  // 1 Sekunde  
await msg.waiting.after.message(5000);  // 5 Sekunden
await msg.waiting.after.message(30000); // 30 Sekunden

// Dynamische Wartezeiten
const waitTime = Math.random() * 3000 + 1000; // 1-4 Sekunden
await msg.waiting.after.message(waitTime);
```

### **Perfekt für:**
- ✅ **Realistische Bot-Gespräche** - Menschenähnliche Pausen
- ✅ **Spannungsaufbau** - Dramatische Pausen in Geschichten
- ✅ **API-Wartezeiten** - Zeit für externe Requests
- ✅ **User Experience** - Natürliche Gesprächsrhythmen
- ✅ **Rate Limiting** - Vermeidung von Spam

---

## 🎭 Hidetag System

### **Versteckte Erwähnungen - Deine coole API!**
```javascript
// Alle Gruppenmitglieder erwähnen (unsichtbar)
await msg.reply("Wichtige Nachricht für alle!", [], { hidetag: "all" });

// Nur den Sender erwähnen (unsichtbar)
await msg.reply("Nur für dich!", [], { hidetag: "sender" });

// Spezifische Person erwähnen (unsichtbar)
await msg.reply("Geheime Nachricht!", [], { hidetag: "1234567890@s.whatsapp.net" });
```

### **Hidetag Features**
- ✅ **Unsichtbare Mentions** - Erwähnungen ohne @-Anzeige
- ✅ **Group-only** - Funktioniert nur in Gruppen (Sicherheit)
- ✅ **Flexible Targets** - All, Sender, oder spezifische JID
- ✅ **Kombinierbar** - Mit normalen Mentions kombinierbar
- ✅ **Admin-Tools** - Perfekt für Moderatoren

### **Praktische Anwendungen**
```javascript
// Admin-Ankündigungen
client.addCommand('announce', async (msg, args) => {
    if (!(await msg.isAdmin())) {
        return msg.reply('❌ Nur für Admins!');
    }
    
    const announcement = args.join(' ');
    await msg.reply(`📢 **Ankündigung:** ${announcement}`, [], { hidetag: "all" });
});

// Geheime Nachrichten
client.addCommand('whisper', async (msg, args) => {
    const mentions = msg.getMentions();
    if (mentions.length === 0) {
        return msg.reply('❌ Erwähne einen User mit @');
    }
    
    const secretMessage = args.slice(1).join(' ');
    await msg.reply(`🤫 Geheime Nachricht: ${secretMessage}`, [], { hidetag: mentions[0] });
});

// Wichtige Updates
client.addCommand('update', async (msg, args) => {
    const update = args.join(' ');
    await msg.reply(`🔄 **Update:** ${update}\n\n_Alle wurden benachrichtigt_`, [], { hidetag: "all" });
});
```

### **Hidetag vs. Normale Mentions**
```javascript
// Normal (sichtbar): @user1 @user2 Hallo!
await msg.reply("Hallo!", [user1, user2]);

// Hidetag (unsichtbar): Hallo! (aber alle bekommen Benachrichtigung)
await msg.reply("Hallo!", [], { hidetag: "all" });

// Kombiniert: @user1 Hallo! (+ unsichtbare Erwähnung aller anderen)
await msg.reply("Hallo!", [user1], { hidetag: "all" });
```

---

## 🎨 Sticker Creation

### **Professionelle Sticker-Erstellung mit Sharp**
```javascript
// Sticker aus URL
await msg.create.sticker.fromUrl('https://example.com/image.jpg', {
    pack: 'Mein Pack',
    author: 'Bot',
    quality: 'high',
    crop: true
});

// Sticker aus lokalem Bild
await msg.create.sticker.fromImage('./photo.jpg', {
    pack: 'Local Stickers',
    quality: 'medium',
    width: 512,
    height: 512
});

// Text-Sticker
await msg.create.sticker.fromText('Hello World!', {
    backgroundColor: '#FF6B6B',
    textColor: '#FFFFFF',
    fontSize: 64,
    pack: 'Text Stickers'
});

// Animierte Sticker aus Video/GIF
await msg.create.sticker.fromVideo('./animation.gif', {
    animated: true,
    quality: 'high',
    duration: 6,
    fps: 15
});

// Sticker aus Buffer
const imageBuffer = fs.readFileSync('image.png');
await msg.create.sticker.fromMedia(imageBuffer, {
    pack: 'Buffer Stickers',
    crop: true
});
```

### **Sticker-Optionen**
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

### **Auto-Sticker System**
```javascript
// Automatische Sticker-Erstellung aus gesendeten Bildern
client.on('message', async (msg) => {
    if (msg.type === 'imageMessage' && msg.text?.toLowerCase() === 'sticker') {
        try {
            await msg.reply('🎨 Erstelle Sticker aus deinem Bild...');
            
            // Bild-Buffer aus Message extrahieren (vereinfacht)
            const imageBuffer = await msg.downloadMedia();
            
            await msg.create.sticker.fromMedia(imageBuffer, {
                pack: 'User Stickers',
                author: msg.getSender().split('@')[0],
                quality: 'high'
            });
            
            await msg.reply('✅ Sticker erstellt!');
        } catch (error) {
            await msg.reply(`❌ Fehler: ${error.message}`);
        }
    }
});
```

### **Sticker Commands**
```javascript
// URL zu Sticker
client.addCommand('sticker', async (msg, args) => {
    if (args.length === 0) {
        return msg.reply('❌ Verwendung: !sticker <image-url>');
    }
    
    const url = args[0];
    try {
        await msg.reply('🎨 Erstelle Sticker...');
        await msg.create.sticker.fromUrl(url, {
            pack: 'Bot Stickers',
            author: 'WAEngine'
        });
        await msg.reply('✅ Sticker erstellt!');
    } catch (error) {
        await msg.reply(`❌ Fehler: ${error.message}`);
    }
});

// Text zu Sticker
client.addCommand('textsticker', async (msg, args) => {
    const text = args.join(' ');
    if (!text) {
        return msg.reply('❌ Verwendung: !textsticker <text>');
    }
    
    try {
        await msg.create.sticker.fromText(text, {
            pack: 'Text Stickers',
            backgroundColor: '#4ECDC4',
            textColor: '#FFFFFF',
            fontSize: 48
        });
    } catch (error) {
        await msg.reply(`❌ Fehler: ${error.message}`);
    }
});
```

### **Sticker Features**
- ✅ **Sharp Integration** - Professionelle Bild-Verarbeitung
- ✅ **WebP Optimierung** - Perfekte WhatsApp-Kompatibilität
- ✅ **Auto-Resize** - Automatische Größenanpassung
- ✅ **Quality Control** - High/Medium/Low Qualitäts-Stufen
- ✅ **Text Rendering** - SVG-basierte Text-Sticker
- ✅ **Animation Support** - GIF/Video zu animierten Stickern
- ✅ **Batch Processing** - Mehrere Sticker gleichzeitig
- ✅ **Error Handling** - Graceful Fallbacks

---

## 🎤 Visual Recording

### **Recording Indicator - Wie echte Sprachnachrichten!**
```javascript
// Recording an/aus
await msg.visualRecord(true);   // Recording AN
await msg.visualRecord(false);  // Recording AUS

// Recording für bestimmte Zeit
await msg.simulateRecording(3000); // 3 Sekunden Recording

// Recording + automatische Antwort
await msg.recordAndReply("Das ist meine Antwort!", 2500);

// Recording + Custom Function
await msg.recordAndSend(async () => {
    await msg.sendImage('photo.jpg', 'Foto nach Recording!');
}, 3000);
```

### **Realistische Voice-Message Simulation**
```javascript
client.addCommand('voice', async (msg, args) => {
    const message = args.join(' ') || 'Das ist eine simulierte Sprachnachricht!';
    
    // Berechne realistische Recording-Zeit basierend auf Text-Länge
    const recordingTime = Math.max(2000, message.length * 100); // ~100ms pro Zeichen
    
    await msg.recordAndReply(message, recordingTime);
});

// Lange "Sprachnachricht"
client.addCommand('longvoice', async (msg) => {
    await msg.reply('🎤 Nehme lange Sprachnachricht auf...');
    
    // Starte Recording
    await msg.visualRecord(true);
    
    // Simuliere lange Aufnahme (10 Sekunden)
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Stoppe Recording
    await msg.visualRecord(false);
    
    await msg.reply('🎵 Hier ist meine 10-Sekunden Sprachnachricht! (simuliert)');
});
```

### **Recording + Typing Kombinationen**
```javascript
client.addCommand('think-speak', async (msg) => {
    // Erst denken (typing)
    await msg.visualWrite(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await msg.visualWrite(false);
    
    await msg.reply('💭 Hmm, lass mich das aufnehmen...');
    
    // Dann aufnehmen (recording)
    await msg.recordAndReply('🎤 Das ist meine durchdachte Antwort!', 3000);
});

// Conversation Flow
client.addCommand('conversation', async (msg) => {
    await msg.reply('👋 Hallo! Lass uns reden...');
    
    await msg.waiting.after.message(1000);
    await msg.typeAndReply('Ich tippe gerade...', 2000);
    
    await msg.waiting.after.message(500);
    await msg.recordAndReply('Und jetzt nehme ich eine Sprachnachricht auf!', 3000);
    
    await msg.waiting.after.message(1000);
    await msg.reply('✅ Conversation Demo beendet!');
});
```

### **Recording Features**
- ✅ **WhatsApp-kompatibel** - Echter Recording-Indicator
- ✅ **Flexible Dauer** - Von 1 Sekunde bis beliebig lang
- ✅ **Auto-Stop** - Automatisches Stoppen nach Zeit
- ✅ **Kombinierbar** - Mit Typing und Waiting kombinierbar
- ✅ **Realistic Timing** - Basierend auf Text-Länge
- ✅ **Error Handling** - Fallback bei Fehlern
- ✅ **Chain Support** - Mehrere Recordings hintereinander

### **Recording vs. Typing**
```javascript
// Typing (schreibt Text)
await msg.visualWrite(true);
await msg.waiting.after.message(2000);
await msg.visualWrite(false);
await msg.reply('Getippte Nachricht');

// Recording (nimmt Sprache auf)
await msg.visualRecord(true);
await msg.waiting.after.message(3000);
await msg.visualRecord(false);
await msg.reply('Aufgenommene Nachricht');

// Kombiniert für realistische Gespräche
await msg.typeAndReply('Ich überlege...', 1500);
await msg.waiting.after.message(500);
await msg.recordAndReply('Hier ist meine Antwort!', 2500);
```

---

## 🔌 Plugin System

### **Optionales Plugin System - 8 Plugins mit 80+ Commands!**

WAEngine verfügt über ein revolutionäres Plugin-System mit **optionalem Loading**. Plugins werden nur geladen, wenn explizit aufgerufen!

#### **🔧 Optionales Plugin Loading**
```javascript
import { WhatsAppClient } from 'waengine';

const client = new WhatsAppClient();

// 🔌 OPTIONAL: Plugins nur laden wenn gewünscht
await client.load.Plugins('economy-system');    // Economy System laden
await client.load.Plugins('games-plugin');      // Games Plugin laden
await client.load.Plugins('creative-plugin');   // Creative Plugin laden
await client.load.Plugins('analytics-plugin');  // Analytics Plugin laden

// Oder alle auf einmal:
await client.load.Plugins('all');

// Ohne diese Zeilen: KEINE Plugins geladen!
```

#### **🎯 Verfügbare Plugins (8 Plugins)**

**💰 Economy System Plugin**
- `!balance` - Kontostand anzeigen
- `!daily` - Tägliche Belohnung abholen
- `!shop` - Shop mit Items anzeigen
- `!work` - Arbeiten gehen für Coins
- `!pay @user 100` - Geld überweisen
- `!buy 1` - Item aus Shop kaufen
- `!inventory` - Inventar anzeigen
- `!leaderboard` - Reichste User
- `!gamble 50` - Glücksspiel
- `!rob @user` - User berauben

**🎮 Games Plugin**
- `!dice` - Würfel werfen
- `!rps schere` - Schere-Stein-Papier
- `!quiz` - Quiz starten
- `!number` - Zahlenraten-Spiel
- `!trivia` - Trivia-Fragen
- `!hangman` - Galgenmännchen
- `!riddle` - Rätsel lösen
- `!memory` - Memory-Spiel
- `!math` - Mathe-Quiz
- `!wordchain` - Wortkette

**🎵 Music Plugin**
- `!play despacito` - Musik auf YouTube suchen
- `!lyrics hello adele` - Songtexte finden
- `!playlist` - Playlist verwalten
- `!radio` - Online Radio
- `!spotify` - Spotify Integration
- `!soundcloud` - SoundCloud Suche
- `!charts` - Aktuelle Charts
- `!artist eminem` - Künstler-Info
- `!album thriller` - Album-Info
- `!genre rock` - Genre erkunden

**✈️ Travel Plugin**
- `!weather Berlin` - Wetter abfragen
- `!flight MUC BER` - Flüge suchen
- `!hotel Berlin` - Hotels finden
- `!currency EUR USD` - Währung umrechnen
- `!translate hallo en` - Text übersetzen
- `!timezone Berlin` - Zeitzone anzeigen
- `!distance Berlin München` - Entfernung berechnen
- `!country Germany` - Länder-Info
- `!city Berlin` - Stadt-Info
- `!map Berlin` - Karte anzeigen

**📚 Education Plugin**
- `!wiki JavaScript` - Wikipedia-Suche
- `!math 2+2*3` - Mathe-Rechner
- `!code console.log()` - Code erklären
- `!define programming` - Wort definieren
- `!synonym happy` - Synonyme finden
- `!grammar` - Grammatik-Check
- `!spell` - Rechtschreibung
- `!fact` - Zufällige Fakten
- `!quote` - Inspirierende Zitate
- `!learn javascript` - Lern-Ressourcen

**🛡️ Moderation Plugin**
- `!automod on` - Auto-Moderation aktivieren
- `!warn @user spam` - User warnen
- `!rules` - Regeln anzeigen
- `!mute @user 10m` - User stumm schalten
- `!ban @user` - User bannen
- `!kick @user` - User kicken
- `!promote @user` - User befördern
- `!demote @user` - Admin entfernen
- `!antilink on` - Link-Schutz
- `!antispam on` - Spam-Schutz

**🎨 Creative Plugin**
- `!meme 1 Programmieren` - Meme erstellen
- `!joke` - Witz erzählen
- `!ascii heart` - ASCII-Art erstellen
- `!qr Hello World` - QR-Code generieren
- `!color #FF0000` - Farb-Info
- `!logo WAEngine` - Logo erstellen
- `!banner Welcome` - Banner erstellen
- `!sticker` - Sticker erstellen
- `!gif search cats` - GIF suchen
- `!emoji 😀` - Emoji-Info

**📊 Analytics Plugin**
- `!mystats` - Eigene Statistiken
- `!topusers` - Aktivste User
- `!heatmap` - Aktivitätsmuster
- `!globalstats` - Globale Statistiken
- `!commands` - Command-Statistiken
- `!usage` - Bot-Nutzung
- `!growth` - Wachstums-Statistiken
- `!export` - Daten exportieren
- `!report` - Detaillierter Report
- `!insights` - Tiefe Einblicke

### **🚀 Auto-Loading System**
```javascript
import { WhatsAppClient } from "waengine";

const client = new WhatsAppClient();

// Plugins werden automatisch nach WhatsApp-Verbindung geladen!
await client.connect();

// ✅ Alle 8 Plugins sind sofort verfügbar!
```

### **📦 Verfügbare Plugins (8 Plugins)**

#### **💰 Economy System**
Vollständiges Wirtschaftssystem mit Coins, Shop und Belohnungen
```javascript
// Verfügbare Commands:
!balance        // Kontostand anzeigen
!daily          // Tägliche Belohnung (100-500 Coins)
!work           // Arbeiten gehen (50-200 Coins)
!shop           // Shop mit Items anzeigen
!buy <id>       // Item kaufen
!transfer @user <amount>  // Coins übertragen
!leaderboard    // Top 10 reichste User
```

#### **🎮 Games Plugin**
Verschiedene Spiele und Unterhaltung
```javascript
// Verfügbare Commands:
!dice [seiten]  // Würfel werfen (Standard: 6 Seiten)
!flip           // Münze werfen
!rps <choice>   // Schere-Stein-Papier (rock/paper/scissors)
!quiz           // Quiz mit zufälligen Fragen
!number         // Zahlenraten-Spiel (1-100)
!8ball <frage>  // Magische 8-Ball Antworten
```

#### **🎵 Music Plugin**
Musik-Suche und YouTube Integration
```javascript
// Verfügbare Commands:
!play <song>    // Musik auf YouTube suchen
!lyrics <song>  // Songtexte finden
!playlist       // Persönliche Playlist verwalten
!playlist add <song>    // Song zur Playlist hinzufügen
!playlist show  // Playlist anzeigen
!trending       // Trending Musik anzeigen
```

#### **✈️ Travel Plugin**
Reise-Informationen und Wetter
```javascript
// Verfügbare Commands:
!weather <stadt>        // Aktuelles Wetter
!forecast <stadt>       // 5-Tage Wettervorhersage
!flight <von> <nach>    // Flugsuche
!hotel <stadt>          // Hotel-Empfehlungen
!currency <von> <nach> <betrag>  // Währungsrechner
!travel <stadt>         // Reise-Tipps
```

#### **📚 Education Plugin**
Bildungs-Tools und Lernhilfen
```javascript
// Verfügbare Commands:
!wiki <begriff>     // Wikipedia-Artikel suchen
!define <wort>      // Wort-Definition
!math <ausdruck>    // Mathematische Berechnungen
!code <code>        // Code-Erklärungen
!learn [thema]      // Lernressourcen anzeigen
!fact               // Zufällige Fakten
!study start/stop   // Lernzeit tracken
```

#### **🛡️ Moderation Plugin**
Erweiterte Moderation und Auto-Mod
```javascript
// Verfügbare Commands:
!warn @user [grund]     // User warnen
!unwarn @user           // Warnung entfernen
!warnings [@user]       // Warnungen anzeigen
!kick @user [grund]     // User kicken
!automod [on/off]       // Auto-Moderation verwalten
!modstats               // Moderations-Statistiken
!rules                  // Gruppenregeln anzeigen
!setrules <regel1> | <regel2>  // Regeln festlegen
!purge <anzahl>         // Nachrichten löschen (experimentell)
```

**Auto-Moderation Features:**
- ✅ **Spam-Erkennung** - 5 Nachrichten in 10 Sekunden
- ✅ **Verbotene Wörter Filter** - Anpassbare Wortliste
- ✅ **Caps-Check** - Zu viele Großbuchstaben (>70%)
- ✅ **Emoji-Limit** - Zu viele Emojis (>10)
- ✅ **Automatische Warnungen** - 3 Strikes = Kick

#### **🎨 Creative Plugin**
Kreative Tools für Memes, ASCII-Art und mehr
```javascript
// Verfügbare Commands:
!meme <nummer> <text>   // Meme mit Templates erstellen
!quote                  // Inspirierende Zitate
!ascii <typ>            // ASCII-Art (heart, star, smile, cat, dog)
!textart <text>         // Großer Text-Art
!colortext <text> [stil] // Bunter Text (rainbow, fire, ocean, nature, space)
!fact                   // Unglaubliche Fakten
!joke                   // Lustige Witze
!story                  // Story-Prompt Generator
!inspire                // Zufällige Inspiration
!creative               // Plugin-Übersicht
```

#### **📊 Analytics Plugin**
Detaillierte Statistiken und Analytics
```javascript
// Verfügbare Commands:
!stats [@user]          // User-Statistiken anzeigen
!mystats                // Eigene Statistiken
!groupstats             // Gruppen-Statistiken
!globalstats            // Globale Statistiken
!topusers [anzahl]      // Top User nach Nachrichten
!topgroups [anzahl]     // Top Gruppen
!topcommands [anzahl]   // Meist genutzte Commands
!heatmap [me/group]     // Aktivitäts-Heatmap
!analytics              // Plugin-Übersicht
!export                 // Persönliche Daten exportieren
```

**Tracking Features:**
- ✅ **Nachrichten-Tracking** - Anzahl und Zeichen
- ✅ **Aktivitätsmuster** - Stunden- und Tages-Heatmaps
- ✅ **Command-Statistiken** - Meist genutzte Commands
- ✅ **Gruppen-Analytics** - Top User pro Gruppe
- ✅ **Automatisches Tracking** - Läuft im Hintergrund

### **🔧 Plugin Manager**
```javascript
// Plugin Status abrufen
const stats = client.pluginManager.getStats();
console.log(`${stats.loaded}/${stats.available} Plugins geladen`);

// Einzelnes Plugin laden
await client.pluginManager.load('economy-system');

// Alle Plugins laden
await client.pluginManager.loadAllPlugins();

// Plugin-Liste
const plugins = client.pluginManager.list();
```

### **💾 Plugin Storage Integration**
Jedes Plugin nutzt das WAEngine Storage System:
```javascript
// In Plugins verfügbar:
this.client.storage.write.in('economy').set(`${userId}.coins`, 1000);
const coins = this.client.storage.read.from('economy').get(`${userId}.coins`) || 0;
this.client.storage.write.in('analytics').increment('totalMessages', 1);
```

### **🎮 Plugin Test Commands**
```javascript
// Plugin System testen
!plugin-test    // Alle 80+ Plugin Commands anzeigen
!plugins        // Plugin Status und Statistiken

// Einzelne Plugin Tests
!test-economy   // Economy System testen
!test-games     // Games Plugin testen
!test-creative  // Creative Plugin testen
!test-analytics // Analytics Plugin testen
!test-all       // Alle Plugins nacheinander testen
```

### **📁 Plugin Struktur**
```
plugins/
├── economy-system/
│   ├── index.js          # Plugin-Klasse
│   └── config.json       # Plugin-Konfiguration
├── games-plugin/
├── music-plugin/
├── travel-plugin/
├── education-plugin/
├── moderation-plugin/
├── creative-plugin/
└── analytics-plugin/
```

### **🚀 Plugin Features**
- ✅ **Auto-Loading** - Alle Plugins laden automatisch nach WhatsApp-Verbindung
- ✅ **80+ Commands** - Über 80 verschiedene Commands verfügbar
- ✅ **Persistent Storage** - Jedes Plugin hat eigene Datenspeicherung
- ✅ **Event Integration** - Plugins können auf Messages und Events reagieren
- ✅ **Admin-Schutz** - Admin-only Commands automatisch geschützt
- ✅ **Error Handling** - Graceful Fallbacks bei Plugin-Fehlern
- ✅ **Windows-kompatibel** - Funktioniert perfekt auf Windows
- ✅ **Modular** - Jedes Plugin ist unabhängig und erweiterbar

### **🎯 Plugin Kategorien**
- **💰 Economy** - Wirtschaftssystem, Coins, Shop
- **🎮 Games** - Spiele, Unterhaltung, Quiz
- **🎵 Music** - Musik-Suche, Playlists, YouTube
- **✈️ Travel** - Wetter, Reisen, Währungen
- **📚 Education** - Lernen, Wikipedia, Mathe
- **🛡️ Moderation** - Auto-Mod, Warnungen, Regeln
- **🎨 Creative** - Memes, ASCII-Art, Witze
- **📊 Analytics** - Statistiken, Heatmaps, Tracking

---

## � Advanced Features

### **400+ Erweiterte WhatsApp-Funktionen in 11 Kategorien!**

WAEngine v1.7.3 bietet die umfangreichste Sammlung von Advanced WhatsApp Features:

- 🎵 **Advanced Media Features** - Voice, Video, GIFs, Thumbnails
- 💬 **Advanced Message Features** - Forward, Edit, Pin, Star, Quote
- 🎨 **Rich Content Features** - Buttons, Lists, Templates, Carousels  
- 👥 **Advanced Group Features** - Settings, Descriptions, Invite Links
- 🔒 **Privacy & Security Features** - Block/Unblock, Privacy Settings
- 📊 **Analytics & Monitoring** - Online Status, Delivery Status, Archive
- 📢 **Advanced Status Features** - Status Updates, Views
- 💼 **Business Features** - Business Profile, Products, Payments
- ⚙️ **System Features** - Backup, Restore, Export, Sync
- 🖼️ **Profile Picture Features** - Get/Send Profile Pictures
- 🤖 **EasyBot Integration** - Alle Features in EasyBot verfügbar

### **🎵 Advanced Media Features**

#### **Voice Messages**
```javascript
// Standard Client
await msg.sendVoiceMessage('./audio.ogg');
await msg.sendVoiceToMentioned('./audio.ogg'); // An alle erwähnten User

// EasyBot
bot.when('voice test').voice('./audio.ogg').done();
```

#### **Video Messages**  
```javascript
// Standard Client
await msg.sendVideoMessage('./video.mp4');
await msg.sendVideoMessageToMentioned('./video.mp4');

// EasyBot
bot.when('video test').videoMessage('./video.mp4').done();
```

#### **GIF Support**
```javascript
// Standard Client
await msg.sendGif('./animation.gif', 'Coole Animation!');
await msg.sendGifToMentioned('./animation.gif', 'Für alle!');

// EasyBot
bot.when('gif test').gif('./animation.gif', 'Test GIF').done();
```

#### **Thumbnails**
```javascript
await msg.sendVideoWithThumbnail('./video.mp4', './thumb.jpg', 'Video mit Thumbnail');
await msg.sendImageWithThumbnail('./image.jpg', './thumb.jpg', 'Bild mit Thumbnail');
```

### **💬 Advanced Message Features**

#### **Forward Messages**
```javascript
// Standard Client
await msg.forward('target@s.whatsapp.net'); // An spezifischen Chat
await msg.forwardToMentioned(); // An alle erwähnten User
await msg.forwardToSender(); // Zurück an Sender

// EasyBot
bot.when('forward test').forward().done(); // Automatisch an Mentions oder Sender
```

#### **Edit Messages**
```javascript
await msg.edit('Neue Nachricht');
```

#### **Pin/Unpin Messages (Nur Gruppen)**
```javascript
// Standard Client
await msg.pin();
await msg.unpin();

// EasyBot
bot.when('pin test').pin().done();
```

#### **Star/Unstar Messages**
```javascript
// Standard Client
await msg.star();
await msg.unstar();

// EasyBot  
bot.when('star test').star().done();
```

#### **Quote Messages**
```javascript
// Standard Client
await msg.quote('Das ist ein Zitat!');

// EasyBot
bot.when('quote test').quote('Zitat Text').done();
```

#### **Reply to Specific Messages**
```javascript
await msg.replyTo('message-id', 'Antwort auf spezifische Nachricht');
await msg.replyToSender('Antwort an Sender');
```

### **🎨 Rich Content Features**

#### **Button Messages**
```javascript
// Standard Client
const buttons = [
    { id: 'btn1', text: '✅ Ja' },
    { id: 'btn2', text: '❌ Nein' },
    { id: 'btn3', text: '🤔 Vielleicht' }
];
await msg.sendButtons('Wähle eine Option:', buttons, 'Footer Text');

// EasyBot
bot.when('button test')
   .buttons('Wähle:', [
       { id: 'opt1', text: 'Option 1' },
       { id: 'opt2', text: 'Option 2' }
   ], 'Footer')
   .done();
```

#### **List Messages**
```javascript
// Standard Client
const sections = [
    {
        title: 'Kategorie 1',
        rows: [
            { title: 'Option 1', description: 'Beschreibung 1', id: 'opt1' },
            { title: 'Option 2', description: 'Beschreibung 2', id: 'opt2' }
        ]
    }
];
await msg.sendList('Titel', 'Beschreibung', 'Button Text', sections);

// EasyBot
bot.when('list test')
   .list('Titel', 'Beschreibung', 'Button', sections)
   .done();
```

#### **Template Messages**
```javascript
await msg.sendTemplate('template-id', {
    text: 'Template Text',
    footer: 'Footer',
    buttons: []
});
```

#### **Carousel Messages**
```javascript
const cards = [
    {
        title: 'Card 1',
        subtitle: 'Untertitel',
        body: 'Card Inhalt',
        footer: 'Footer',
        image: './image1.jpg',
        buttons: []
    }
];
await msg.sendCarousel(cards);
```

### **👥 Advanced Group Features**

#### **Group Settings**
```javascript
await client.group.setSettings(groupId, {
    messagesAdminOnly: true,
    editGroupInfo: 'admin_only'
});
```

#### **Group Description & Subject**
```javascript
await client.group.setDescription(groupId, 'Neue Beschreibung');
await client.group.setSubject(groupId, 'Neuer Gruppenname');
```

#### **Invite Links**
```javascript
// Standard Client
const inviteLink = await client.group.getInviteLink(groupId);
await client.group.revokeInviteLink(groupId);
await client.group.join('invite-code');

// EasyBot
bot.when('invite').inviteLink().done();
```

#### **Leave Group**
```javascript
await client.group.leave(groupId);
```

#### **Update Group Picture**
```javascript
await client.group.updatePicture(groupId, './group-pic.jpg');
```

### **🔒 Privacy & Security Features**

#### **Block/Unblock Users**
```javascript
// Standard Client
await client.privacy.block('user@s.whatsapp.net');
await client.privacy.unblock('user@s.whatsapp.net');

// EasyBot
bot.when('block user').block().done(); // Blockiert Mentions oder Sender
bot.when('unblock user').unblock().done();
```

#### **Privacy Settings**
```javascript
await client.privacy.setSettings({
    lastSeen: 'contacts', // 'everyone', 'contacts', 'nobody'
    profilePic: 'contacts',
    status: 'contacts'
});
```

#### **Read Receipts**
```javascript
await client.privacy.markRead(chatId, messageId);
await client.privacy.markUnread(chatId);
```

### **📊 Analytics & Monitoring**

#### **Online Status**
```javascript
// Standard Client
const isOnline = await client.analytics.isOnline('user@s.whatsapp.net');
const lastSeen = await client.analytics.getLastSeen('user@s.whatsapp.net');

// EasyBot
bot.when('check online').checkOnline().done(); // Prüft Mentions oder Sender
```

#### **Delivery Status**
```javascript
const status = await client.analytics.getDeliveryStatus(messageKey);
// Returns: { sent: true, delivered: false, read: false, timestamp: ... }
```

#### **Archive/Unarchive Chats**
```javascript
// Standard Client
await client.analytics.archiveChat(chatId);
await client.analytics.unarchiveChat(chatId);

// EasyBot
bot.when('archive').archive().done();
```

#### **Mute/Unmute Chats**
```javascript
// Standard Client
await client.analytics.muteChat(chatId, 8 * 60 * 60 * 1000); // 8 Stunden
await client.analytics.unmuteChat(chatId);

// EasyBot
bot.when('mute').mute(480).done(); // 480 Minuten = 8 Stunden
```

### **📢 Advanced Status Features**

#### **Send Status Updates**
```javascript
// Standard Client
await client.status.send('text', 'Mein Status Text', {
    backgroundColor: '#000000',
    font: 0
});

await client.status.send('image', './status-image.jpg', {
    caption: 'Status Bild'
});

// EasyBot
bot.when('status test').sendStatus('Status Text').done();
```

#### **Get Status Views**
```javascript
const views = await client.status.getViews();
// Returns: { totalViews: 0, viewers: [] }
```

#### **Get User Status**
```javascript
const userStatus = await client.status.getUserStatus('user@s.whatsapp.net');
// Returns: { status: "Verfügbar", lastUpdated: Date }
```

### **💼 Business Features**

#### **Business Profile**
```javascript
await client.business.setProfile({
    description: 'Mein Business',
    category: 'Technology',
    email: 'contact@business.com',
    website: 'https://business.com',
    address: 'Business Adresse'
});
```

#### **Product Messages**
```javascript
await client.business.sendProduct('product-id', 'catalog-id');
```

#### **Create Products**
```javascript
await client.business.createProduct({
    name: 'Produkt Name',
    description: 'Produkt Beschreibung',
    price: 99.99,
    currency: 'EUR',
    images: ['./product1.jpg', './product2.jpg']
});
```

#### **Payment Requests**
```javascript
await client.business.sendPaymentRequest(50.00, 'EUR', 'Zahlung für Service');
```

### **⚙️ System Features**

#### **Backup & Restore**
```javascript
// Standard Client
const backup = await client.system.backup();
await client.system.restoreFromBackup(backupData);

// EasyBot
bot.when('backup').backup().done();
```

#### **Export Chat**
```javascript
const chatHistory = await client.system.exportChat(chatId, 'json');
```

#### **Import Contacts**
```javascript
const contactList = [
    { name: 'John Doe', phone: '+1234567890' }
];
const results = await client.system.importContacts(contactList);
```

#### **Sync with Phone**
```javascript
await client.system.syncWithPhone();
```

#### **Device Management**
```javascript
const devices = await client.system.getLinkedDevices();
await client.system.unlinkDevice('device-id');
```

### **🖼️ Profile Picture Features**

#### **Get Profile Pictures**
```javascript
const profilePicUrl = await msg.getProfilePicture('user@s.whatsapp.net');
```

#### **Send Profile Pictures**
```javascript
// Standard Client
await msg.sendProfilePicture('user@s.whatsapp.net', 'Profilbild Caption');

// Mit Commands
client.addCommand('profilpic', async (msg, args) => {
    const mentions = msg.getMentions();
    if (mentions.length > 0) {
        await msg.sendProfilePicture(mentions[0]);
    }
});

client.addCommand('meinprofil', async (msg, args) => {
    await msg.sendProfilePicture(msg.getSender(), 'Dein Profilbild');
});
```

### **🤖 EasyBot Advanced Integration**

#### **Einfache Chains**
```javascript
const bot = EasyBot.create();

bot
    .when('test all')
    .voice('./audio.ogg')
    .forward()
    .pin()
    .star()
    .buttons('Wähle:', [{ id: 'opt1', text: 'Option 1' }])
    .groupInfo()
    .checkOnline()
    .archive()
    .sendStatus('Test Status')
    .backup()
    .reply('Alle Features getestet!')
    .done();
```

#### **Erweiterte EasyBot Features**
```javascript
// Advanced EasyBot mit allen Features
const advancedBot = EasyBot.create()
    .enableDefaults()
    .enableAll(); // Aktiviert alle Standard-Features

// Komplexe Chains mit Bedingungen
advancedBot
    .when('admin command')
    .if('is group')
    .then('groupInfo')
    .if('is admin')
    .then('pin')
    .done();
```

#### **EasyBot Factory Methods**
```javascript
// Verschiedene Bot-Typen
const standardBot = EasyBot.create();
const multiBot = EasyBot.createMulti(3); // 3 Devices
const quickBot = EasyBot.quick(); // Mit Defaults
const robustBot = EasyBot.createRobust(); // Robuste Verbindung
```

### **📝 Mentions & Dynamic Targets**

Alle Advanced Features funktionieren mit:

- **Mentions**: `@user` in Nachrichten
- **Sender ID**: Automatisch der Nachrichtensender  
- **Statische JIDs**: Feste WhatsApp-IDs
- **Dynamische Targets**: Zur Laufzeit bestimmt

```javascript
// Beispiele für dynamische Targets
bot.when('voice @user').voice('./audio.ogg').done(); // An erwähnte User
bot.when('forward back').forward().done(); // Zurück an Sender
bot.when('check @user online').checkOnline().done(); // Online-Status von Mentions
```

### **🎮 Advanced Test Commands**

#### **Media Commands**
- **`!voice`** - Voice Message senden
- **`!videomsg`** - Video Message senden
- **`!gif`** - GIF senden
- **`!thumbnail`** - Video mit Thumbnail

#### **Message Commands**
- **`!forward`** - Nachricht weiterleiten
- **`!edit`** - Nachricht bearbeiten
- **`!pin`** - Nachricht anheften (Admin)
- **`!star`** - Nachricht markieren
- **`!quote`** - Nachricht zitieren

#### **Rich Content Commands**
- **`!buttons`** - Button-Nachricht senden
- **`!list`** - List-Nachricht senden
- **`!template`** - Template-Nachricht
- **`!carousel`** - Carousel-Nachricht

#### **Group Commands**
- **`!groupsettings`** - Gruppeneinstellungen (Admin)
- **`!setdescription`** - Gruppenbeschreibung (Admin)
- **`!invitelink`** - Einladungslink erstellen (Admin)
- **`!grouppic`** - Gruppenbild ändern (Admin)

#### **Privacy Commands**
- **`!block @user`** - User blockieren
- **`!unblock @user`** - User entblockieren
- **`!privacy`** - Privacy-Einstellungen
- **`!markread`** - Als gelesen markieren

#### **Analytics Commands**
- **`!isonline @user`** - Online-Status prüfen
- **`!lastseen @user`** - Zuletzt online
- **`!archive`** - Chat archivieren
- **`!mute`** - Chat stumm schalten

#### **Status Commands**
- **`!sendstatus`** - Status senden
- **`!statusviews`** - Status-Views anzeigen
- **`!userstatus @user`** - User-Status abrufen

#### **Business Commands**
- **`!businessprofile`** - Business-Profil setzen
- **`!sendproduct`** - Produkt senden
- **`!createproduct`** - Produkt erstellen
- **`!paymentrequest`** - Zahlungsanfrage

#### **System Commands**
- **`!backup`** - Backup erstellen
- **`!exportchat`** - Chat exportieren
- **`!importcontacts`** - Kontakte importieren
- **`!syncphone`** - Mit Handy synchronisieren
- **`!devices`** - Verknüpfte Geräte anzeigen

#### **Profile Picture Commands**
- **`!profilpic @user`** - Profilbild von User senden
- **`!meinprofil`** - Eigenes Profilbild senden

---

## 🔥 Feature Count: **645+ Funktionen!**

- **Message Functions:** 15+
- **Group Functions:** 8+  
- **Permission Functions:** 6+
- **Statistics Functions:** 5+
- **Typing Functions:** 8+
- **Command System:** 15+ (Chat-spezifische Prefixes)
- **Event System:** 8+
- **QR Functions:** 3+
- **Utility Functions:** 15+
- **Multi-Device System:** 20+
- **🆕 EasyBot System:** 25+
- **🆕 Storage System:** 15+ (NEU in v1.0.7)
- **🆕 AI Integration:** 10+ (NEU in v1.0.8)
- **🆕 HTTP Client:** 12+ (NEU in v1.0.8)
- **🆕 Scheduler System:** 8+ (NEU in v1.0.8)
- **🆕 Waiting System:** 5+ (NEU in v1.0.8)
- **🆕 Hidetag System:** 5+ (NEU in v1.0.8)
- **🆕 Sticker Creation:** 8+ (NEU in v1.0.8)
- **🆕 Visual Recording:** 7+ (NEU in v1.0.8)
- **🔥 Plugin System:** 80+ (NEU in v1.0.9) **OPTIONAL LOADING!**
- **🚀 Advanced Media Features:** 35+ (NEU in v1.7.3)
- **🚀 Advanced Message Features:** 40+ (NEU in v1.7.3)
- **🚀 Rich Content Features:** 45+ (NEU in v1.7.3)
- **🚀 Advanced Group Features:** 25+ (NEU in v1.7.3)
- **🚀 Privacy & Security Features:** 30+ (NEU in v1.7.3)
- **🚀 Analytics & Monitoring:** 35+ (NEU in v1.7.3)
- **🚀 Advanced Status Features:** 20+ (NEU in v1.7.3)
- **🚀 Business Features:** 25+ (NEU in v1.7.3)
- **🚀 System Features:** 30+ (NEU in v1.7.3)
- **🚀 Profile Picture Features:** 15+ (NEU in v1.7.3)
- **🚀 EasyBot Advanced Integration:** 100+ (NEU in v1.7.3)

---

## 🚀 Warum WAEngine wählen?

### **🎯 Drei APIs in einem**
- **EasyBot** - 3-Zeilen Bot Creation für Anfänger
- **Advanced** - Vollkontrolle für Profis  
- **Multi-Device** - Skalierung mit mehreren Accounts

### **🔥 Einzigartige Features**
- **Multi-Device Load Balancing** - Industry First!
- **Action Chaining** - jQuery-Style Bot Building
- **Realistic Typing** - Menschenähnliche Interaktionen
- **Edge QR Integration** - Nahtlose Authentifizierung
- **Template System** - Dynamische Inhalte mit Variablen
- **🆕 AI Integration** - ChatGPT/Claude Support
- **🆕 Storage System** - `write.in("file").set(key, value)`
- **🆕 HTTP Client** - Weather, News, Crypto APIs
- **🆕 Scheduler System** - Cron + One-time Jobs
- **🆕 Waiting System** - `await msg.waiting.after.message(ms)`
- **🆕 Hidetag System** - `msg.reply("text", [], { hidetag: "all" })`
- **🆕 Sticker Creation** - `msg.create.sticker.fromMedia()` mit Sharp
- **🆕 Visual Recording** - `msg.visualRecord()`, `msg.recordAndReply()`
- **🔥 Plugin System** - 8 Optionale Plugins mit 80+ Commands **OPTIONAL LOADING!**
- **🚀 Advanced Media** - Voice, Video, GIF, Thumbnails (400+ Features)
- **🚀 Rich Content** - Buttons, Lists, Templates, Carousels
- **🚀 Business Features** - Products, Payments, Business Profile
- **🚀 Privacy & Security** - Block/Unblock, Privacy Settings
- **🚀 Analytics** - Online Status, Delivery Status, Archive
- **🚀 Profile Pictures** - Get/Send Profile Pictures mit Commands

### **💪 Production Ready**
- **Persistent Auth** - Einmalige Einrichtung
- **Auto Reconnection** - Behandelt Verbindungsabbrüche
- **Health Monitoring** - Device Status verfolgen
- **Error Handling** - Graceful Failure Recovery
- **TypeScript Support** - Vollständige Type Definitions
- **🆕 Persistent Storage** - Automatische JSON-Dateien
- **🆕 Job Scheduling** - Überlebt Neustarts
- **🆕 AI Moderation** - Automatische Content-Filterung
- **🔥 Plugin Architecture** - Modulares System mit Auto-Loading
- **🚀 Advanced Features** - 400+ neue WhatsApp-Funktionen
- **🚀 Robust Connection** - Ultra-robuste Verbindung mit Auto-Reconnect
- **🚀 Dynamic Targets** - Mentions, Sender ID, statische JIDs
- **🚀 EasyBot Integration** - Alle Advanced Features in Chains verfügbar

### **📈 Skalierbare Architektur**
- **Load Balancing** - Message Load verteilen
- **Failover System** - Automatisches Device Switching  
- **Rate Limit Bypass** - Multiple Account Limits
- **Plugin Ready** - Erweiterbar für v2.0
- **🆕 Microservices Ready** - HTTP Client für externe APIs
- **🆕 Event-Driven** - Scheduler + Waiting System
- **🆕 AI-Powered** - Intelligente Responses
- **🔥 Plugin Ecosystem** - 8 Plugins mit 80+ Commands sofort verfügbar
- **🚀 Advanced WhatsApp API** - 400+ neue Funktionen in 11 Kategorien
- **🚀 Rich Content Support** - Buttons, Lists, Templates, Carousels
- **🚀 Business Ready** - Products, Payments, Business Profile
- **🚀 Enterprise Features** - Privacy, Security, Analytics, Monitoring

---

## 🎮 Verfügbare Test Commands

### **Basic Commands**
- **`!help`** - Alle Commands anzeigen
- **`!ping`** - Pong Response  
- **`!stats`** - Statistiken anzeigen

### **Admin Commands**
- **`!kick @user`** - User kicken (nur Admin)
- **`!warn @user <reason>`** - User warnen (nur Admin)
- **`!setprefix <prefix>`** - Prefix ändern (nur Admin)

### **🆕 AI Commands**
- **`!ai <frage>`** - AI Chat
- **`!translate <sprache> <text>`** - Text übersetzen
- **`!moderate <text>`** - Content moderieren

### **🆕 HTTP Commands**
- **`!wetter <stadt>`** - Wetter abrufen
- **`!news [kategorie]`** - Aktuelle News
- **`!crypto [symbol]`** - Crypto-Preise
- **`!short <url>`** - URL kürzen

### **🆕 Scheduler Commands**
- **`!remind <minuten> <text>`** - Erinnerung erstellen
- **`!daily <zeit> <text>`** - Tägliche Nachricht
- **`!jobs`** - Scheduler Statistiken

### **🆕 Storage Commands**
- **`!setdata <key> <value>`** - Daten speichern
- **`!getdata <key>`** - Daten abrufen
- **`!count up/down [name]`** - Counter System

### **🆕 Hidetag Commands**
- **`!hidetag <text>`** - Alle erwähnen (unsichtbar)
- **`!announce <text>`** - Admin-Ankündigung mit Hidetag
- **`!whisper @user <text>`** - Geheime Nachricht

### **🆕 Sticker Commands**
- **`!sticker <url>`** - Sticker aus URL
- **`!textsticker <text>`** - Text-Sticker
- **Sende Bild mit "sticker"** - Auto-Sticker

### **🆕 Plugin Commands**
- **`!plugin-test`** - Alle 80+ Plugin Commands anzeigen
- **`!plugins`** - Plugin Status und Statistiken
- **`!balance`** - Economy: Kontostand anzeigen
- **`!daily`** - Economy: Tägliche Belohnung
- **`!dice`** - Games: Würfel werfen
- **`!quiz`** - Games: Quiz starten
- **`!play <song>`** - Music: Musik suchen
- **`!weather <stadt>`** - Travel: Wetter abrufen
- **`!wiki <begriff>`** - Education: Wikipedia suchen
- **`!warn @user`** - Moderation: User warnen (Admin)
- **`!automod on`** - Moderation: Auto-Mod aktivieren (Admin)
- **`!meme 1 <text>`** - Creative: Meme erstellen
- **`!joke`** - Creative: Witz erzählen
- **`!mystats`** - Analytics: Eigene Statistiken
- **`!topusers`** - Analytics: Top User anzeigen
- **`!heatmap`** - Analytics: Aktivitätsmuster

### **🆕 Plugin Test Commands**
- **`!test-economy`** - Economy System testen
- **`!test-games`** - Games Plugin testen
- **`!test-creative`** - Creative Plugin testen
- **`!test-analytics`** - Analytics Plugin testen
- **`!test-all`** - Alle Plugins nacheinander testen

### **🚀 Advanced Feature Commands (NEU in v1.7.3)**

#### **Media Commands**
- **`!voice`** - Voice Message senden
- **`!videomsg`** - Video Message senden
- **`!gif`** - GIF senden
- **`!thumbnail`** - Video mit Thumbnail

#### **Message Commands**
- **`!forward`** - Nachricht weiterleiten
- **`!edit`** - Nachricht bearbeiten
- **`!pin`** - Nachricht anheften (Admin)
- **`!star`** - Nachricht markieren
- **`!quote`** - Nachricht zitieren

#### **Rich Content Commands**
- **`!buttons`** - Button-Nachricht senden
- **`!list`** - List-Nachricht senden
- **`!template`** - Template-Nachricht
- **`!carousel`** - Carousel-Nachricht

#### **Group Commands**
- **`!groupsettings`** - Gruppeneinstellungen (Admin)
- **`!setdescription`** - Gruppenbeschreibung (Admin)
- **`!invitelink`** - Einladungslink erstellen (Admin)
- **`!grouppic`** - Gruppenbild ändern (Admin)

#### **Privacy Commands**
- **`!block @user`** - User blockieren
- **`!unblock @user`** - User entblockieren
- **`!privacy`** - Privacy-Einstellungen
- **`!markread`** - Als gelesen markieren

#### **Analytics Commands**
- **`!isonline @user`** - Online-Status prüfen
- **`!lastseen @user`** - Zuletzt online
- **`!archive`** - Chat archivieren
- **`!mute`** - Chat stumm schalten

#### **Status Commands**
- **`!sendstatus`** - Status senden
- **`!statusviews`** - Status-Views anzeigen
- **`!userstatus @user`** - User-Status abrufen

#### **Business Commands**
- **`!businessprofile`** - Business-Profil setzen
- **`!sendproduct`** - Produkt senden
- **`!createproduct`** - Produkt erstellen
- **`!paymentrequest`** - Zahlungsanfrage

#### **System Commands**
- **`!backup`** - Backup erstellen
- **`!exportchat`** - Chat exportieren
- **`!importcontacts`** - Kontakte importieren
- **`!syncphone`** - Mit Handy synchronisieren
- **`!devices`** - Verknüpfte Geräte anzeigen

#### **Profile Picture Commands**
- **`!profilpic @user`** - Profilbild von User senden
- **`!meinprofil`** - Eigenes Profilbild senden

---

*Made with ❤️ for WhatsApp Automation*

**Die mächtigste WhatsApp Bot Library - von 3-Zeilen-Bots bis zu KI-gestützten Enterprise Multi-Device Systemen mit vollständigem Plugin-Ecosystem (8 Plugins, 80+ Commands), 400+ Advanced Features in 11 Kategorien, Hidetag, Sticker Creation, Visual Recording, Rich Content (Buttons, Lists, Carousels), Business Features, Privacy & Security, Analytics & Monitoring und Profile Picture API!**