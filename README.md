# 🚀 WhatsApp Multi Client

[![NPM Version](https://img.shields.io/npm/v/whatsapp-multi-client)](https://www.npmjs.com/package/whatsapp-multi-client)
[![Downloads](https://img.shields.io/npm/dm/whatsapp-multi-client)](https://www.npmjs.com/package/whatsapp-multi-client)
[![License](https://img.shields.io/npm/l/whatsapp-multi-client)](https://github.com/yourusername/whatsapp-multi-client/blob/main/LICENSE)
[![Node.js](https://img.shields.io/node/v/whatsapp-multi-client)](https://nodejs.org/)

**The most powerful WhatsApp Bot Library with Multi-Device Support & EasyBot API**

🎯 **Perfect for beginners AND professionals**  
🔧 **Multi-Device Load Balancing**  
⚡ **3-Line Bot Creation**  
🚀 **120+ Features Built-in**

---

## ⚡ Quick Start (3 Lines!)

```javascript
import { quickBot } from "whatsapp-multi-client";

quickBot()
    .when("hello").reply("Hi! 👋")
    .start();
```

**That's it!** Your WhatsApp bot is running! 🎉

---

## 📦 Installation

```bash
npm install whatsapp-multi-client
```

**Requirements:**
- Node.js 16+
- A WhatsApp account for the bot

---

## 🎯 Choose Your API

### 🟢 **EasyBot** - For Beginners
Perfect for quick bots and learning:

```javascript
import { createBot } from "whatsapp-multi-client";

createBot()
    .when("ping").reply("Pong! 🏓")
    .when("hello").reply("Hi there! 👋")
    .command("time", () => new Date().toLocaleString())
    .start();
```

### 🔵 **Advanced API** - For Professionals
Full control and customization:

```javascript
import { WhatsAppClient } from "whatsapp-multi-client";

const client = new WhatsAppClient();
client.setPrefix('!');

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
import { MultiWhatsAppClient } from "whatsapp-multi-client";

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
import { quickBot } from "whatsapp-multi-client";

quickBot()
    .when("hello").reply("Hi! 👋")
    .start();
```

### **Action Chaining**
Chain multiple actions elegantly:

```javascript
import { createBot } from "whatsapp-multi-client";

createBot()
    .when("important")
        .react("⚠️")
        .type(2)
        .reply("This is important!")
        .react("✅")
        .done()
    .start();
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
import { multiBot } from "whatsapp-multi-client";

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
import { MultiWhatsAppClient } from "whatsapp-multi-client";

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
// Set prefix
const prefix = "!"
client.setPrefix(prefix)

// Register commands
client.addCommand('help', async (msg, args) => {
    await msg.reply('Help text')
})

client.addCommand('ping', async (msg, args) => {
    await msg.reply('Pong! 🏓')
})
```

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
import { generateQRCode } from "whatsapp-multi-client"

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
import { quickBot } from "whatsapp-multi-client";

// 3 lines = complete bot!
quickBot()
    .when("hello").reply("Hi! 👋")
    .start();
```

### **EasyBot with Action Chaining**
```javascript
import { createBot } from "whatsapp-multi-client";

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
import { multiBot } from "whatsapp-multi-client";

multiBot(2) // 2 devices
    .when("test").reply("Multi-device test!")
    .command("status", "📊 2 devices active!")
    .start();
```

### **Multi-Device Bot**
```javascript
import { MultiWhatsAppClient } from "whatsapp-multi-client";

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
import { WhatsAppClient } from "whatsapp-multi-client";

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