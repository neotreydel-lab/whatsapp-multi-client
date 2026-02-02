# 🚀 WAEngine v1.7.4 - Session Authentication Fix Edition

[![NPM Version](https://img.shields.io/npm/v/waengine)](https://www.npmjs.com/package/waengine)
[![Downloads](https://img.shields.io/npm/dm/waengine)](https://www.npmjs.com/package/waengine)
[![License](https://img.shields.io/npm/l/waengine)](https://github.com/neotreydel-lab/waengine/blob/main/LICENSE)
[![Node.js](https://img.shields.io/node/v/waengine)](https://nodejs.org/)

**The most powerful WhatsApp Bot Library with 400+ Advanced Features**

🌍 **Universal Cross-Platform** - Works on ALL devices and platforms  
🎯 **Sequential Multi-Device** - Professional QR scanning, one at a time  
🧹 **Clean Terminal** - Anti-spam QR system, professional output  
⚡ **3-Line Bot Creation** - From beginners to enterprise  
🚀 **400+ Advanced Features** ⬆️ **FIXED in v1.7.4**  
🔌 **Plugin System 2.0** - 8 built-in plugins with hot-loading  
🎵 **Advanced Media** - Voice, Video, GIFs, Thumbnails  
💬 **Rich Content** - Buttons, Lists, Templates, Carousels  
👥 **Group Management** - Settings, Invites, Admin Tools  
🔒 **Privacy & Security** - Block/Unblock, Privacy Settings  
📊 **Analytics** - Online Status, Delivery Tracking  
🖼️ **Profile Pictures** - Get/Send Profile Pictures

---

## ⚡ Quick Start (3 Lines!)

```javascript
import { quickBot } from "waengine";

quickBot()
    .when("hello").reply("Hi! 👋")
    .when("voice test").voice("./audio.ogg") // NEW: Voice Messages!
    .when("buttons").buttons("Choose:", [{ id: "1", text: "Option 1" }]) // NEW: Rich Content!
    .start();
```

**That's it!** Your advanced WhatsApp bot is running with 400+ features! 🎉

---

## 📦 Installation

```bash
npm install waengine
```

**Requirements:**
- Node.js 16+
- A WhatsApp account for the bot

---

## 🆕 What's New in v1.7.4 - Session Authentication Fix Edition

### 🚨 **Critical Authentication Fixes**
- **FIXED:** "Successfully connected" messages before QR-code scan
- **FIXED:** "Device erfolgreich authentifiziert" without authentication
- **FIXED:** Premature success messages with socket-only connection
- **FIXED:** Missing distinction between socket vs authenticated state

### 📱 **Enhanced QR-Code System**
- **FIXED:** Multiple QR-codes (Single Device Mode default)
- **FIXED:** QR-code size issues (always small/extra-small)
- **FIXED:** QR-code showing with existing valid session
- **ROBUST:** Auth folder existence validation

### 🔐 **New Authentication Events**
```javascript
// NEW: Only fires after real authentication
client.on('truly_connected', (data) => {
    console.log(`🎉 Authenticated as: ${data.userId}`);
});
```

### 🎯 **Perfect Authentication Flow**
1. **Socket connects** → "Socket verbunden - warte auf Authentifizierung..."
2. **QR-code displayed** → User scans QR-code
3. **Authentication happens** → `creds.update` event
4. **Success messages** → Only after `creds.me?.id` exists
5. **Bot ready** → `truly_connected` event fired

---

## 🆕 Previous Features (v1.7.3)

### 🎵 **Advanced Media Features**
- **Voice Messages** - Send voice notes with `msg.sendVoiceMessage()`
- **Video Messages** - Send video notes with `msg.sendVideoMessage()`
- **GIF Support** - Send animated GIFs with `msg.sendGif()`
- **Thumbnails** - Add thumbnails to videos and images

### 💬 **Advanced Message Features**
- **Forward Messages** - Forward to mentions, sender, or specific chats
- **Edit Messages** - Edit sent messages with `msg.edit()`
- **Pin Messages** - Pin important messages in groups
- **Star Messages** - Star/bookmark messages
- **Quote Messages** - Quote and reply to messages

### 🎨 **Rich Content Features**
- **Button Messages** - Interactive buttons with callbacks
- **List Messages** - Organized lists with sections
- **Template Messages** - Reusable message templates
- **Carousel Messages** - Swipeable card carousels

### 👥 **Advanced Group Features**
- **Group Settings** - Control who can send messages
- **Group Description** - Update group descriptions
- **Invite Links** - Generate and manage invite links
- **Group Pictures** - Update group profile pictures

### 🔒 **Privacy & Security Features**
- **Block/Unblock Users** - Manage blocked contacts
- **Privacy Settings** - Control last seen, profile pic visibility
- **Read Receipts** - Mark messages as read/unread

### 📊 **Analytics & Monitoring**
- **Online Status** - Check if users are online
- **Delivery Status** - Track message delivery
- **Archive Chats** - Archive/unarchive conversations
- **Mute Chats** - Mute notifications for specific chats

### 📢 **Advanced Status Features**
- **Status Updates** - Send text, image, video status
- **Status Views** - Track who viewed your status
- **User Status** - Get user's current status

### 💼 **Business Features**
- **Business Profile** - Set up business information
- **Product Messages** - Send product catalogs
- **Payment Requests** - Request payments from users

### ⚙️ **System Features**
- **Backup & Restore** - Backup chat data and settings
- **Export Chats** - Export chat history
- **Device Management** - Manage linked devices
- **Sync with Phone** - Sync with main WhatsApp

### 🖼️ **Profile Picture Features**
- **Get Profile Pictures** - Retrieve user profile pictures
- **Send Profile Pictures** - Send profile pics in chat
- **Commands**: `!profilpic @user` and `!meinprofil`

### 🌍 **Universal Cross-Platform QR System**
- **Works everywhere** - Windows, macOS, Linux, Docker, Raspberry Pi, Android
- **Intelligent browser detection** - Edge, Chrome, Firefox, Safari auto-detection
- **Smart fallback system** - Playwright → HTTP Server → Terminal QR
- **ES Module fixes** - No more `require is not defined` errors

### 🎯 **Sequential Multi-Device Setup**
- **One QR at a time** - No more confusion with multiple QR codes
- **Progress indicators** - Clear 1/3, 2/3, 3/3 progress
- **Smart pauses** - 3 seconds between devices for preparation
- **Error handling** - Continue on failure, robust setup

### 🧹 **Clean QR System (Anti-Spam)**
- **No terminal spam** - Max 3 QR displays, 30s intervals
- **Multiple modes** - Clean, Terminal Only, Browser Only, Silent
- **Professional output** - Terminal clearing, clean display
- **Configurable** - Customize intervals, max displays, modes

```javascript
// v1.5.0 - Works on ALL platforms!
import { quickBot } from "waengine";

quickBot()
    .when("hello").reply("Hi! 👋")
    .start();
// ✅ QR-Code automatically optimized for your platform!
```

---

## 🎯 Choose Your API

### 🟢 **EasyBot** - For Beginners
Perfect for quick bots and learning:

```javascript
import { createBot } from "waengine";

createBot()
    .when("ping").reply("Pong! 🏓")
    .when("hello").reply("Hi there! 👋")
    .command("time", () => new Date().toLocaleString())
    .start();
```

### 🔧 **Advanced API** - For Professionals
Full control and customization:

```javascript
import { WhatsAppClient } from "waengine";

const client = new WhatsAppClient();
client.setPrefix('!');

// NEW: Ignore offline messages to prevent spam
client.ignore.message.offline(true);

client.on('message', async (msg) => {
    if (msg.text === 'hello') {
        await msg.simulateTyping('Hello! How can I help?');
    }
});

await client.connect();
```

### 🟡 **Multi-Device** - For Scale
Run multiple WhatsApp accounts simultaneously:

```javascript
import { MultiWhatsAppClient } from "waengine";

const multiClient = new MultiWhatsAppClient({
    maxDevices: 3,
    loadBalancing: 'round-robin'
});

await multiClient.addDevice('bot1');
await multiClient.addDevice('bot2');
await multiClient.connect();

// Messages automatically load-balanced across devices!
await multiClient.sendMessage(chatId, { text: 'Hello from multi-device!' });
```

---

## ⚡ EasyBot - For Beginners

### **Super Simple API**
Create WhatsApp bots in minutes, not hours!

```javascript
import { quickBot } from "waengine";

quickBot()
    .when("hello").reply("Hi! 👋")
    .start();
```

### **🆕 Enhanced Action Chaining v1.1.0**
```javascript
createBot()
    .when("demo")
        .react("🎬")
        .type(2)
        .reply("Starting demo...")
        .wait(1000)
        .sendImage("demo.jpg", "Demo image")
        .slowTypeWithMention("Hello @user! This is for you! 🎉")
        .aiReply("Explain this demo")
        .saveData("demos", "count", 1)
        .done()
    .start();
```

### **🆕 New Mention Actions**
```javascript
bot
    .when("hello").slowTypeWithMention("Hello @user! 👋")
    .when("quick").quickTypeWithMention("Hey @user! ⚡")
    .when("normal").normalTypeWithMention("Hi @user! 😊")
    .when("mention").mentionSender("Thanks @user!")
    .when("all").mentionAll("Hello everyone! 👥");
```

### **EasyBot Features**
```javascript
const bot = createBot()
    // Simple responses
    .when("hello").reply("Hi! 👋")
    .when("ping").reply("Pong! 🏓")
    
    // Auto-responses
    .autoReply("hi", "Hello!")
    .autoReply("bye", "Goodbye!")
    
    // Commands
    .command("help", "I can help you!")
    .command("time", () => new Date().toLocaleString())
    
    // Templates with variables
    .template("greeting", "Hello {name}! Today is {day}")
    .when("welcome").useTemplate("greeting")
    
    // Conditional logic
    .if("is group").then("reply Hello group!")
    .if("contains bot").then("react 🤖")
    
    // Multi-device (optional)
    .enableMultiDevice(2)
    
    .start();
```

### **EasyBot Multi-Device**
```javascript
import { multiBot } from "waengine";

multiBot(3) // 3 devices
    .when("test").reply("Multi-device test!")
    .command("status", "📊 Multi-device running!")
    .start();
```

### **Template System**
```javascript
bot
    .template("info", "Hello {name}! Time: {time}, Date: {date}")
    .template("status", "Chat: {chat} | Day: {day}")
    .when("info").useTemplate("info")
    .when("status").useTemplate("status");

// Available variables:
// {name} - Sender name
// {sender} - Sender JID  
// {time} - Current time
// {date} - Current date
// {datetime} - Date + time
// {day} - Weekday
// {chat} - "Group" or "Private"
```

---

## 🔥 Multi-Device Support

### **Multi-Device System**
Run 2-3 WhatsApp accounts simultaneously for higher availability and load balancing!

```javascript
import { MultiWhatsAppClient } from "waengine";

const multiClient = new MultiWhatsAppClient({
    maxDevices: 3,
    loadBalancing: 'round-robin' // round-robin, random, least-used, failover
});

// Add devices
await multiClient.addDevice('bot1');
await multiClient.addDevice('bot2'); 
await multiClient.addDevice('bot3');

// Connect all
await multiClient.connect();
```

### **Load Balancing Strategies**
```javascript
// Round-robin (default)
multiClient.setLoadBalancingStrategy('round-robin');

// Random selection
multiClient.setLoadBalancingStrategy('random');

// Least used device
multiClient.setLoadBalancingStrategy('least-used');
```

### **Smart Messaging**
```javascript
// Load-balanced sending
await multiClient.sendMessage(chatId, { text: 'Hello!' });

// Broadcast to all devices
await multiClient.broadcast(chatId, { text: 'Broadcast!' });

// With failover (if one device fails)
await multiClient.sendWithFailover(chatId, { text: 'Failover!' });

// Specific device
await multiClient.sendFromDevice('bot1', chatId, { text: 'From Bot1!' });
```

### **Multi-Device Events**
```javascript
multiClient.on('message', async (msg) => {
    console.log(`Message from device: ${msg.deviceId}`);
    
    // Reply from same device
    await msg.replyFromSameDevice('Same device reply');
    
    // Reply via load balancing
    await msg.replyFromAnyDevice('Load balanced reply');
    
    // Broadcast reply
    await msg.broadcastReply('Broadcast reply');
});

// Device status events
multiClient.on('device.connected', (data) => {
    console.log(`✅ Device ${data.deviceId} connected`);
});

multiClient.on('device.disconnected', (data) => {
    console.log(`🔴 Device ${data.deviceId} disconnected`);
});
```

### **Health Monitoring**
```javascript
// Get status
const status = multiClient.getStatus();
console.log(`${status.activeDevices}/${status.totalDevices} devices active`);

// Health check
const health = multiClient.getHealthCheck();
console.log(`Health: ${health.healthPercentage}% - ${health.recommendation}`);

// Device stats
const stats = multiClient.getDeviceStats();
```

### **Multi-Device Benefits:**
✅ **Higher availability** - If one account gets banned, others continue  
✅ **Load distribution** - Spread messages across multiple accounts  
✅ **Rate limit bypass** - WhatsApp limits per account  
✅ **Automatic failover** - Seamless switching on failures  
✅ **Separate auth** - Each device has its own authentication  

---

## 🔐 Authentication

### **Persistent Authentication**
- ✅ **One-time QR scan** → Always auto-connect
- ✅ **Microsoft Edge integration** - QR code in browser
- ✅ **Terminal fallback** - QR code in terminal
- ✅ **Auto-reconnect** - Automatic reconnection

```javascript
const client = new WhatsAppClient({
    authDir: "./auth",        // Auth data storage
    printQR: false,          // QR in browser (true = terminal)
    logLevel: "silent"       // Log level
});
```

---

## 💬 Message System

### **Basic Messaging**
```javascript
// Simple reply
await msg.reply("Hello!")

// With mentions
await msg.reply("Hello @user!", [userJid])
```

### **Media Messages**
```javascript
// Images
await msg.sendImage("path/image.jpg", "Caption", [mentions])

// Videos
await msg.sendVideo("path/video.mp4", "Caption", [mentions])

// Audio
await msg.sendAudio("path/audio.mp3")

// Stickers
await msg.sendSticker("path/sticker.webp")

// Documents
await msg.sendDocument("path/file.pdf", "filename.pdf", [mentions])
```

### **Special Messages**
```javascript
// Location
await msg.sendLocation(latitude, longitude)

// Contact
await msg.sendContact(vcard, "Display Name")

// Emoji reaction
await msg.react("😂")

// Delete message
await msg.delete()
```

### **Message Properties**
```javascript
msg.id          // Message ID
msg.from        // Sender JID
msg.text        // Message text
msg.type        // text, image, video, audio, etc.
msg.isGroup     // true/false
msg.timestamp   // Unix timestamp
msg.raw         // Raw Baileys object
```

---

## 🎭 Typing Indicator

### **Manual Control**
```javascript
// Start/stop typing
await msg.visualWrite(true)           // Typing ON
await msg.visualWrite(false)          // Typing OFF

// Typing for specific time
await msg.typeFor(3000)               // 3 seconds typing
```

### **Typing + Reply Combined**
```javascript
// Fixed time
await msg.typeAndReply("Message", 2000)  // 2 seconds typing

// Realistic typing
await msg.simulateTyping("Long text...", {
    typingSpeed: 50,        // ms per character
    minTypingTime: 1000,    // Minimum time
    maxTypingTime: 5000,    // Maximum time
    mentions: [userJid]     // With mentions
})
```

---

## 👥 Group Management

### **Group Information**
```javascript
// Group metadata
const metadata = await client.get.GroupMetadata(groupId)

// All participants
const participants = await client.get.GroupParticipants(groupId)

// Only admins
const admins = await client.get.GroupAdmins(groupId)
```

### **User Management**
```javascript
// Add user
await client.add.user(groupId, [userJid], [mentions])

// Remove user
await client.kick.user(groupId, [userJid], [mentions])

// Promote to admin
await client.promote.user(groupId, [userJid], [mentions])

// Remove admin
await client.demote.user(groupId, [userJid], [mentions])
```

### **Mention System**
```javascript
// Mention single person
await msg.replyWithMention("Hello @user!", userJid)

// Mention all in group
await msg.mentionAll("Hello everyone!")

// NEW in v1.1.0: Mention with Typing
await msg.slowTypeWithMention("Hello @user! How are you?", userJid)
await msg.quickTypeWithMention("Hey @user! 👋", userJid)  
await msg.normalTypeWithMention("Hi @user, nice to see you!", userJid)

// Get mentions from message
const mentions = msg.getMentions()

// Check if mentioned
const isMentioned = msg.isMentioned(userJid)
```

---

## 🛡️ Permission System

### **Permission Checks**
```javascript
// Admin checks
const isAdmin = await msg.isAdmin()        // Is sender admin?
const isBotAdmin = await msg.isBotAdmin()  // Is bot admin?
const isOwner = await msg.isOwner()        // Is sender owner?

// Chat type checks
const isGroup = msg.isGroup               // Is group?
const isPrivate = msg.isPrivate()         // Is private chat?

// Sender info
const senderJid = msg.getSender()         // Sender JID
```

### **Usage in Commands**
```javascript
client.addCommand('kick', async (msg, args) => {
    if (!msg.isGroup) {
        return msg.reply('❌ Groups only!')
    }
    
    if (!(await msg.isAdmin())) {
        return msg.reply('❌ Admins only!')
    }
    
    if (!(await msg.isBotAdmin())) {
        return msg.reply('❌ Bot needs admin rights!')
    }
    
    // Kick logic...
})
```

---

## 📊 Statistics System

### **Message Statistics**
```javascript
// Message counts
const stats = await msg.stats.getMessageCount()
// Returns: { total: 1234, today: 56, thisWeek: 234 }

// User activity
const activity = await msg.stats.getUserActivity(userId)
// Returns: { messagesCount: 123, lastSeen: Date, isActive: true }

// Group stats (groups only)
const groupStats = await msg.stats.getGroupStats()
// Returns: { groupName, totalMembers, admins, created, description }

// Top active users
const topUsers = await msg.stats.getMostActiveUsers(5)

// Messages by type
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
```

### **Chat-spezifische Prefixes (v1.0.7)**
Jeder Chat/Gruppe kann einen eigenen Prefix haben:

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

// Prefix Info Command
client.addCommand('prefixinfo', async (msg) => {
    const chatPrefix = client.getChatPrefix(msg.from);
    const stats = client.getPrefixStats();
    
    await msg.reply(`🎯 Aktueller Prefix: "${chatPrefix}"\n📊 Gesamt Chats: ${stats.totalChats}`);
});
```

**Features:**
- ✅ **Persistent Storage** - Prefixes werden automatisch gespeichert
- ✅ **Admin-only** - Nur Admins können Prefixes in Gruppen ändern
- ✅ **Validierung** - Max 5 Zeichen, keine Leerzeichen
- ✅ **Statistics** - Übersicht über alle verwendeten Prefixes
- ✅ **Fallback** - Global Prefix als Standard

### **Command Properties**
```javascript
// In message events
if (msg.isCommand) {
    console.log(msg.command)      // "help"
    console.log(msg.args)         // ["arg1", "arg2"]
    console.log(msg.commandText)  // "help arg1 arg2"
}
```

### **Command Management**
```javascript
// List commands
const commands = client.getCommands()

// Remove command
client.removeCommand('help')

// Get prefix
const currentPrefix = client.getPrefix()
```

---

## 📊 Poll Integration

### **Create Polls**
```javascript
// Simple poll
await msg.sendPoll('Favorite pizza?', ['Margherita', 'Pepperoni', 'Hawaiian'])

// Multi-selection poll
await msg.sendMultiPoll('Which colors?', ['Red', 'Blue', 'Green'], 2)
```

### **Fallback System**
If native polls don't work, the library automatically uses emoji fallback:
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
// Message events
client.on('message', (msg) => {
    console.log(`Message from ${msg.from}: ${msg.text}`)
})

// Command events
client.on('command', (msg) => {
    console.log(`Command: ${msg.command}`)
})

// Connection events
client.on('connected', () => {
    console.log('Connected!')
})

client.on('disconnected', (data) => {
    console.log('Disconnected:', data.reason)
})

// Group events
client.on('group.participants.update', (update) => {
    console.log('Group changed:', update)
})

// Presence events
client.on('presence.update', (update) => {
    console.log('Status changed:', update)
})
```

### **Event Management**
```javascript
// Remove event handler
client.off('message', handler)

// Emit custom event
client.emit('custom-event', data)
```

---

## 📱 QR Code System

### **QR Code Generation**
```javascript
import { generateQRCode } from "waengine"

// Generate QR code
await generateQRCode()

// QR code with data
await generateQRCode(qrData)

// Close browser
await closeBrowser()
```

### **Features**
- ✅ **Microsoft Edge integration** - Automatic opening
- ✅ **Terminal fallback** - QR in terminal if browser fails
- ✅ **Auto-close** - Browser closes automatically after login

---

## 🔧 Utility Functions

### **Connection Management**
```javascript
// Connect
await client.connect()

// Disconnect
await client.disconnect()

// Get status
const state = client.getConnectionState()
// Returns: { isConnected: true, socket: true }
```

### **Presence Management**
```javascript
// Global presence
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

## 📚 Examples

### **EasyBot (Beginners)**
```javascript
import { quickBot } from "waengine";

// 3 lines = complete bot!
quickBot()
    .when("hello").reply("Hi! 👋")
    .start();
```

### **EasyBot with Action Chaining**
```javascript
import { createBot } from "waengine";

createBot()
    .when("important")
        .react("⚠️")        // Reaction
        .type(2)            // 2 seconds typing
        .reply("Important!")  // Reply
        .react("✅")        // Another reaction
        .done()             // Back to bot
        
    .when("party")
        .react("🎉")
        .type(1)
        .reply("Party! 🥳")
        .done()
        
    .command("help", "I can help you!")
    .autoReply("hi", "Hello!")
    .start();
```

### **EasyBot Multi-Device**
```javascript
import { multiBot } from "waengine";

multiBot(2) // 2 devices
    .when("test").reply("Multi-device test!")
    .command("status", "📊 2 devices active!")
    .start();
```

### **Multi-Device Bot**
```javascript
import { MultiWhatsAppClient } from "waengine";

const multiClient = new MultiWhatsAppClient({
    maxDevices: 3,
    loadBalancing: 'round-robin'
});

// Add devices
await multiClient.addDevice('main-bot');
await multiClient.addDevice('backup-bot');
await multiClient.addDevice('support-bot');

// Commands for all devices
multiClient.setPrefix('!');

multiClient.addCommand('ping', async (msg) => {
    await msg.replyFromSameDevice(`Pong from ${msg.deviceId}! 🏓`);
});

multiClient.addCommand('status', async (msg) => {
    const status = multiClient.getStatus();
    await msg.replyFromSameDevice(`📊 ${status.activeDevices}/${status.totalDevices} devices active`);
});

multiClient.addCommand('broadcast', async (msg, args) => {
    const message = args.join(' ');
    await multiClient.broadcast(msg.from, { text: `📢 ${message}` });
});

// Events
multiClient.on('message', async (msg) => {
    if (msg.text === 'hello') {
        // Load-balanced response
        await multiClient.sendMessage(msg.from, { 
            text: `Hello from ${msg.deviceId}! 👋` 
        });
    }
});

// Connect all devices
await multiClient.connect();
console.log("🎉 Multi-device bot running!");
```

### **Advanced Bot**
```javascript
import { WhatsAppClient } from "waengine";

const client = new WhatsAppClient();
const prefix = "!";
client.setPrefix(prefix);

// Commands
client.addCommand('ping', async (msg) => {
    await msg.typeAndReply('Pong! 🏓', 1000);
});

client.addCommand('info', async (msg) => {
    await msg.visualWrite(true);
    await new Promise(r => setTimeout(r, 2000));
    await msg.visualWrite(false);
    await msg.reply('Bot info: Running perfectly! ✅');
});

// Events
client.on('message', async (msg) => {
    if (msg.text === 'hello') {
        await msg.simulateTyping('Hello! How are you?');
    }
});

await client.connect();
```

### **Interactive Bot**
```javascript
client.on('message', async (msg) => {
    if (msg.text.includes('how are you')) {
        await msg.visualWrite(true);
        await new Promise(r => setTimeout(r, 3000));
        await msg.visualWrite(false);
        await msg.reply('I\'m doing great, thanks! 😊 How about you?');
    }
    
    if (msg.text.includes('poll')) {
        await msg.quickType('Creating poll...');
        await msg.sendPoll('How do you like the bot?', ['Great!', 'Good', 'Okay', 'Bad']);
    }
});
```

---

## 🎮 Available Commands (Test Bot)

- **`!help`** - Show all commands
- **`!ping`** - Pong response  
- **`!stats`** - Show statistics
- **`!kick @user`** - Kick user (admin only)
- **`!debug`** - Debug information
- **`!poll "Question" "Opt1" "Opt2"`** - Create poll
- **`!demo`** - Typing demo
- **`!customtype 3000 "Text"`** - Custom typing
- **`!slowtype "Text"`** - Slow typing

## 🚀 Advanced Features v1.7.3

### **🎵 Advanced Media Features**

```javascript
// Voice Messages
await msg.sendVoiceMessage('./audio.ogg');
await msg.sendVoiceToMentioned('./audio.ogg'); // To all mentioned users

// Video Messages  
await msg.sendVideoMessage('./video.mp4');
await msg.sendVideoMessageToMentioned('./video.mp4');

// GIF Support
await msg.sendGif('./animation.gif', 'Cool animation!');
await msg.sendGifToMentioned('./animation.gif', 'For everyone!');

// EasyBot Integration
bot.when('voice test').voice('./audio.ogg').done();
bot.when('gif test').gif('./animation.gif', 'Test GIF').done();
```

### **💬 Advanced Message Features**

```javascript
// Forward Messages
await msg.forward('target@s.whatsapp.net'); // To specific chat
await msg.forwardToMentioned(); // To all mentioned users
await msg.forwardToSender(); // Back to sender

// Edit Messages
await msg.edit('New message content');

// Pin/Unpin Messages (Groups only)
await msg.pin();
await msg.unpin();

// Star/Unstar Messages
await msg.star();
await msg.unstar();

// Quote Messages
await msg.quote('This is a quote!');

// EasyBot Integration
bot.when('forward test').forward().done(); // Auto to mentions or sender
bot.when('pin test').pin().done();
bot.when('star test').star().done();
```

### **🎨 Rich Content Features**

```javascript
// Button Messages
const buttons = [
    { id: 'btn1', text: '✅ Yes' },
    { id: 'btn2', text: '❌ No' },
    { id: 'btn3', text: '🤔 Maybe' }
];
await msg.sendButtons('Choose an option:', buttons, 'Footer text');

// List Messages
const sections = [
    {
        title: 'Category 1',
        rows: [
            { title: 'Option 1', description: 'Description 1', id: 'opt1' },
            { title: 'Option 2', description: 'Description 2', id: 'opt2' }
        ]
    }
];
await msg.sendList('Title', 'Description', 'Button Text', sections);

// EasyBot Integration
bot.when('button test')
   .buttons('Choose:', [{ id: 'opt1', text: 'Option 1' }], 'Footer')
   .done();

bot.when('list test')
   .list('Title', 'Description', 'Button', sections)
   .done();
```

### **👥 Advanced Group Features**

```javascript
// Group Information
const metadata = await client.get.GroupMetadata(groupId);

// Group Settings
await client.group.setSettings(groupId, {
    messagesAdminOnly: true,
    editGroupInfo: 'admin_only'
});

// Group Description & Subject
await client.group.setDescription(groupId, 'New description');
await client.group.setSubject(groupId, 'New group name');

// Invite Links
const inviteLink = await client.group.getInviteLink(groupId);
await client.group.revokeInviteLink(groupId);

// EasyBot Integration
bot.when('group info').groupInfo().done();
bot.when('invite').inviteLink().done();
```

### **🔒 Privacy & Security Features**

```javascript
// Block/Unblock Users
await client.privacy.block('user@s.whatsapp.net');
await client.privacy.unblock('user@s.whatsapp.net');

// Privacy Settings
await client.privacy.setSettings({
    lastSeen: 'contacts', // 'everyone', 'contacts', 'nobody'
    profilePic: 'contacts',
    status: 'contacts'
});

// Read Receipts
await client.privacy.markRead(chatId, messageId);
await client.privacy.markUnread(chatId);

// EasyBot Integration
bot.when('block user').block().done(); // Blocks mentions or sender
bot.when('unblock user').unblock().done();
```

### **📊 Analytics & Monitoring**

```javascript
// Online Status
const isOnline = await client.analytics.isOnline('user@s.whatsapp.net');
const lastSeen = await client.analytics.getLastSeen('user@s.whatsapp.net');

// Delivery Status
const status = await client.analytics.getDeliveryStatus(messageKey);

// Archive/Unarchive Chats
await client.analytics.archiveChat(chatId);
await client.analytics.unarchiveChat(chatId);

// Mute/Unmute Chats
await client.analytics.muteChat(chatId, 8 * 60 * 60 * 1000); // 8 hours
await client.analytics.unmuteChat(chatId);

// EasyBot Integration
bot.when('check online').checkOnline().done(); // Checks mentions or sender
bot.when('archive').archive().done();
bot.when('mute').mute(480).done(); // 480 minutes = 8 hours
```

### **📢 Advanced Status Features**

```javascript
// Send Status Updates
await client.status.send('text', 'My status text', {
    backgroundColor: '#000000',
    font: 0
});

await client.status.send('image', './status-image.jpg', {
    caption: 'Status image'
});

// Get Status Views
const views = await client.status.getViews();

// EasyBot Integration
bot.when('status test').sendStatus('Status text').done();
```

### **🖼️ Profile Picture Features**

```javascript
// Get Profile Pictures
const profilePicUrl = await msg.getProfilePicture('user@s.whatsapp.net');

// Send Profile Pictures
await msg.sendProfilePicture('user@s.whatsapp.net', 'Profile pic caption');

// Commands
client.addCommand('profilpic', async (msg, args) => {
    const mentions = msg.getMentions();
    if (mentions.length > 0) {
        await msg.sendProfilePicture(mentions[0]);
    }
});

client.addCommand('meinprofil', async (msg, args) => {
    await msg.sendProfilePicture(msg.getSender(), 'Your profile picture');
});
```

### **⚙️ System Features**

```javascript
// Backup & Restore
const backup = await client.system.backup();
await client.system.restoreFromBackup(backupData);

// Export Chat
const chatHistory = await client.system.exportChat(chatId, 'json');

// Device Management
const devices = await client.system.getLinkedDevices();
await client.system.unlinkDevice('device-id');

// EasyBot Integration
bot.when('backup').backup().done();
```

### **🤖 EasyBot Advanced Integration**

```javascript
const bot = EasyBot.create();

// Complex chains with all advanced features
bot
    .when('test all')
    .voice('./audio.ogg')
    .forward()
    .pin()
    .star()
    .buttons('Choose:', [{ id: 'opt1', text: 'Option 1' }])
    .groupInfo()
    .checkOnline()
    .archive()
    .sendStatus('Test status')
    .backup()
    .reply('All features tested!')
    .done();

// Advanced EasyBot with all features enabled
const advancedBot = EasyBot.create()
    .enableDefaults()
    .enableAll(); // Activates all standard features
```

### **📝 Test All Advanced Features**

```bash
# Run comprehensive test
node advanced-features-test.js

# Test specific features
node test.js
```

### **🎯 Advanced Features Commands**

- **`!voice <path>`** - Send voice message
- **`!videomsg <path>`** - Send video message  
- **`!gif <path> [caption]`** - Send GIF
- **`!forward`** - Forward message
- **`!pin`** - Pin message (admin)
- **`!star`** - Star message
- **`!buttons [text]`** - Button message
- **`!list`** - List message
- **`!groupinfo`** - Group information
- **`!invitelink`** - Invite link (admin)
- **`!block [@user]`** - Block user
- **`!unblock [@user]`** - Unblock user
- **`!online [@user]`** - Check online status
- **`!archive`** - Archive chat
- **`!mute [minutes]`** - Mute chat
- **`!status <text>`** - Send status
- **`!profilpic @user`** - Send profile picture
- **`!meinprofil`** - Send own profile picture
- **`!backup`** - Create backup

---

## 🔥 Feature Count v1.7.3

**Total: 400+ Functions and Features!**

- **Advanced Media Features:** 50+
- **Advanced Message Features:** 40+  
- **Rich Content Features:** 35+
- **Group Management:** 30+
- **Privacy & Security:** 25+
- **Analytics & Monitoring:** 30+
- **Status Features:** 20+
- **Business Features:** 25+
- **System Features:** 35+
- **Profile Picture Features:** 10+
- **EasyBot Integration:** 100+

---

## 🔥 Feature Count

**Total: 120+ Functions and Features!**

- **Message Functions:** 15+
- **Group Functions:** 8+  
- **Permission Functions:** 6+
- **Statistics Functions:** 5+
- **Typing Functions:** 8+
- **Command System:** 10+
- **Event System:** 8+
- **QR Functions:** 3+
- **Utility Functions:** 15+
- **Multi-Device System:** 20+
- **🆕 EasyBot System:** 25+

---

## 🚀 Why Choose This Library?

### **🎯 Three APIs in One**
- **EasyBot** - 3-line bot creation for beginners
- **Advanced** - Full control for professionals  
- **Multi-Device** - Scale with multiple accounts

### **🔥 Unique Features**
- **Multi-Device Load Balancing** - Industry first!
- **Action Chaining** - jQuery-style bot building
- **Realistic Typing** - Human-like interactions
- **Edge QR Integration** - Seamless authentication
- **Template System** - Dynamic content with variables

### **💪 Production Ready**
- **Persistent Auth** - One-time setup
- **Auto Reconnection** - Handles disconnections
- **Health Monitoring** - Track device status
- **Error Handling** - Graceful failure recovery
- **TypeScript Support** - Full type definitions

### **📈 Scalable Architecture**
- **Load Balancing** - Distribute message load
- **Failover System** - Automatic device switching  
- **Rate Limit Bypass** - Multiple account limits
- **Plugin Ready** - Extensible for v2.0

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### **Quick Contribute**
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔮 Roadmap (v2.0)

- **🔌 Plugin System** - Extensible architecture
- **💾 Database Integration** - Persistent storage
- **🌐 Web Dashboard** - Browser-based management
- **📅 Scheduled Messages** - Cron-like scheduling
- **🛡️ Advanced Moderation** - Auto-spam detection
- **🤖 AI Integration** - ChatGPT/Claude support
- **📊 Analytics Dashboard** - Detailed insights
- **🎮 Game Framework** - Interactive bot games

---

## 💖 Support

- **⭐ Star** this repository if you find it helpful
- **🐛 Report bugs** via GitHub Issues
- **💡 Request features** via GitHub Discussions
- **📧 Contact** for commercial support

---

## 🏆 Contributors

Thanks to all contributors who make this project possible! 🎉

---

**Made with ❤️ for WhatsApp Automation**

*The most powerful WhatsApp bot library - from 3-line bots to enterprise multi-device systems!*
