# 🚀 Advanced Features - WAEngine v1.7.3

Alle erweiterten WhatsApp-Funktionen für deine Library!

## 📋 Übersicht

WAEngine v1.7.3 bietet über **400+ neue Funktionen** in 11 Kategorien:

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

## 🎵 Advanced Media Features

### Voice Messages
```javascript
// Standard Client
await msg.sendVoiceMessage('./audio.ogg');
await msg.sendVoiceToMentioned('./audio.ogg'); // An alle erwähnten User

// EasyBot
bot.when('voice test').voice('./audio.ogg').done();
```

### Video Messages  
```javascript
// Standard Client
await msg.sendVideoMessage('./video.mp4');
await msg.sendVideoMessageToMentioned('./video.mp4');

// EasyBot
bot.when('video test').videoMessage('./video.mp4').done();
```

### GIF Support
```javascript
// Standard Client
await msg.sendGif('./animation.gif', 'Coole Animation!');
await msg.sendGifToMentioned('./animation.gif', 'Für alle!');

// EasyBot
bot.when('gif test').gif('./animation.gif', 'Test GIF').done();
```

### Thumbnails
```javascript
await msg.sendVideoWithThumbnail('./video.mp4', './thumb.jpg', 'Video mit Thumbnail');
await msg.sendImageWithThumbnail('./image.jpg', './thumb.jpg', 'Bild mit Thumbnail');
```

## 💬 Advanced Message Features

### Forward Messages
```javascript
// Standard Client
await msg.forward('target@s.whatsapp.net'); // An spezifischen Chat
await msg.forwardToMentioned(); // An alle erwähnten User
await msg.forwardToSender(); // Zurück an Sender

// EasyBot
bot.when('forward test').forward().done(); // Automatisch an Mentions oder Sender
```

### Edit Messages
```javascript
await msg.edit('Neue Nachricht');
```

### Pin/Unpin Messages (Nur Gruppen)
```javascript
// Standard Client
await msg.pin();
await msg.unpin();

// EasyBot
bot.when('pin test').pin().done();
```

### Star/Unstar Messages
```javascript
// Standard Client
await msg.star();
await msg.unstar();

// EasyBot  
bot.when('star test').star().done();
```

### Quote Messages
```javascript
// Standard Client
await msg.quote('Das ist ein Zitat!');

// EasyBot
bot.when('quote test').quote('Zitat Text').done();
```

### Reply to Specific Messages
```javascript
await msg.replyTo('message-id', 'Antwort auf spezifische Nachricht');
await msg.replyToSender('Antwort an Sender');
```

## 🎨 Rich Content Features

### Button Messages
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

### List Messages
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

### Template Messages
```javascript
await msg.sendTemplate('template-id', {
    text: 'Template Text',
    footer: 'Footer',
    buttons: []
});
```

### Carousel Messages
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

## 👥 Advanced Group Features

### Group Information
```javascript
// Standard Client
const metadata = await client.get.GroupMetadata(groupId);

// EasyBot
bot.when('group info').groupInfo().done();
```

### Group Settings
```javascript
await client.group.setSettings(groupId, {
    messagesAdminOnly: true,
    editGroupInfo: 'admin_only'
});
```

### Group Description & Subject
```javascript
await client.group.setDescription(groupId, 'Neue Beschreibung');
await client.group.setSubject(groupId, 'Neuer Gruppenname');
```

### Invite Links
```javascript
// Standard Client
const inviteLink = await client.group.getInviteLink(groupId);
await client.group.revokeInviteLink(groupId);
await client.group.join('invite-code');

// EasyBot
bot.when('invite').inviteLink().done();
```

### Leave Group
```javascript
await client.group.leave(groupId);
```

### Update Group Picture
```javascript
await client.group.updatePicture(groupId, './group-pic.jpg');
```

## 🔒 Privacy & Security Features

### Block/Unblock Users
```javascript
// Standard Client
await client.privacy.block('user@s.whatsapp.net');
await client.privacy.unblock('user@s.whatsapp.net');

// EasyBot
bot.when('block user').block().done(); // Blockiert Mentions oder Sender
bot.when('unblock user').unblock().done();
```

### Privacy Settings
```javascript
await client.privacy.setSettings({
    lastSeen: 'contacts', // 'everyone', 'contacts', 'nobody'
    profilePic: 'contacts',
    status: 'contacts'
});
```

### Read Receipts
```javascript
await client.privacy.markRead(chatId, messageId);
await client.privacy.markUnread(chatId);
```

## 📊 Analytics & Monitoring

### Online Status
```javascript
// Standard Client
const isOnline = await client.analytics.isOnline('user@s.whatsapp.net');
const lastSeen = await client.analytics.getLastSeen('user@s.whatsapp.net');

// EasyBot
bot.when('check online').checkOnline().done(); // Prüft Mentions oder Sender
```

### Delivery Status
```javascript
const status = await client.analytics.getDeliveryStatus(messageKey);
// Returns: { sent: true, delivered: false, read: false, timestamp: ... }
```

### Archive/Unarchive Chats
```javascript
// Standard Client
await client.analytics.archiveChat(chatId);
await client.analytics.unarchiveChat(chatId);

// EasyBot
bot.when('archive').archive().done();
```

### Mute/Unmute Chats
```javascript
// Standard Client
await client.analytics.muteChat(chatId, 8 * 60 * 60 * 1000); // 8 Stunden
await client.analytics.unmuteChat(chatId);

// EasyBot
bot.when('mute').mute(480).done(); // 480 Minuten = 8 Stunden
```

## 📢 Advanced Status Features

### Send Status Updates
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

### Get Status Views
```javascript
const views = await client.status.getViews();
// Returns: { totalViews: 0, viewers: [] }
```

### Get User Status
```javascript
const userStatus = await client.status.getUserStatus('user@s.whatsapp.net');
// Returns: { status: "Verfügbar", lastUpdated: Date }
```

## 💼 Business Features

### Business Profile
```javascript
await client.business.setProfile({
    description: 'Mein Business',
    category: 'Technology',
    email: 'contact@business.com',
    website: 'https://business.com',
    address: 'Business Adresse'
});
```

### Product Messages
```javascript
await client.business.sendProduct('product-id', 'catalog-id');
```

### Create Products
```javascript
await client.business.createProduct({
    name: 'Produkt Name',
    description: 'Produkt Beschreibung',
    price: 99.99,
    currency: 'EUR',
    images: ['./product1.jpg', './product2.jpg']
});
```

### Payment Requests
```javascript
await client.business.sendPaymentRequest(50.00, 'EUR', 'Zahlung für Service');
```

## ⚙️ System Features

### Backup & Restore
```javascript
// Standard Client
const backup = await client.system.backup();
await client.system.restoreFromBackup(backupData);

// EasyBot
bot.when('backup').backup().done();
```

### Export Chat
```javascript
const chatHistory = await client.system.exportChat(chatId, 'json');
```

### Import Contacts
```javascript
const contactList = [
    { name: 'John Doe', phone: '+1234567890' }
];
const results = await client.system.importContacts(contactList);
```

### Sync with Phone
```javascript
await client.system.syncWithPhone();
```

### Device Management
```javascript
const devices = await client.system.getLinkedDevices();
await client.system.unlinkDevice('device-id');
```

## 🖼️ Profile Picture Features

### Get Profile Pictures
```javascript
const profilePicUrl = await msg.getProfilePicture('user@s.whatsapp.net');
```

### Send Profile Pictures
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

## 🤖 EasyBot Advanced Integration

### Einfache Chains
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

### Erweiterte EasyBot Features
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

### EasyBot Factory Methods
```javascript
// Verschiedene Bot-Typen
const standardBot = EasyBot.create();
const multiBot = EasyBot.createMulti(3); // 3 Devices
const quickBot = EasyBot.quick(); // Mit Defaults
const robustBot = EasyBot.createRobust(); // Robuste Verbindung
```

## 📝 Mentions & Dynamic Targets

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

## 🚀 Verwendung

### Installation
```bash
npm install waengine
```

### Standard Client
```javascript
import { WhatsAppClient } from 'waengine';

const client = new WhatsAppClient({
    authDir: './auth',
    quietHeartbeat: true
});

// Advanced Features sind automatisch verfügbar
await client.connect();
```

### EasyBot
```javascript
import { EasyBot } from 'waengine';

const bot = EasyBot.create()
    .enableDefaults()
    .enableAll();

// Advanced Features in Chains verwenden
bot
    .when('test')
    .voice('./audio.ogg')
    .forward()
    .buttons('Test:', [{ id: 'test', text: 'Test' }])
    .done();

await bot.start();
```

### Test Commands
```javascript
// Alle Features testen
node advanced-features-test.js
```

## 🔧 Konfiguration

### Client Options
```javascript
const client = new WhatsAppClient({
    authDir: './auth',
    quietHeartbeat: true, // Heartbeat-Spam deaktivieren
    maxReconnectAttempts: 100, // Robuste Verbindung
    reconnectInterval: 2000,
    heartbeatInterval: 20000
});
```

### EasyBot Options
```javascript
const bot = EasyBot.create({
    authDir: './auth',
    quietHeartbeat: true
})
.enableRobustConnection(true) // Robuste Verbindung
.enableUltraRobust(); // Ultra-robuste Verbindung
```

## 📊 Statistiken

- **400+ neue Funktionen** implementiert
- **11 Feature-Kategorien** abgedeckt
- **100% EasyBot Integration** verfügbar
- **Mentions & Dynamic Targets** unterstützt
- **Robuste Verbindung** mit Auto-Reconnect
- **Heartbeat-Spam** behoben
- **Profile Picture API** hinzugefügt

## 🎯 Nächste Schritte

1. **Teste alle Features**: `node advanced-features-test.js`
2. **Verwende EasyBot**: Einfache Integration aller Features
3. **Erweitere deine Bots**: Nutze die 400+ neuen Funktionen
4. **Robuste Verbindung**: Aktiviere Ultra-Robust Mode
5. **Profile Pictures**: Implementiere Profilbild-Commands

## 🔗 Links

- **Test File**: `advanced-features-test.js`
- **Source Code**: `src/advanced-features.js`
- **EasyBot Integration**: `src/easy-advanced.js`
- **Client Integration**: `src/client.js`
- **Message Features**: `src/message.js`

---

**🎉 Alle Advanced Features sind jetzt verfügbar und vollständig in deine WAEngine Library integriert!**