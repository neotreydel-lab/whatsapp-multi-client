import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Features() {
  const [activeSection, setActiveSection] = useState('');

  // Scroll-to-section function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) {
          current = section.getAttribute('id');
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      id: 'easybot',
      title: '🤖 EasyBot System',
      description: '3-Zeilen Bot Creation für Anfänger',
      items: [
        { 
          name: 'Action Chaining', 
          desc: 'jQuery-Style Bot Building mit .when().reply().react()',
          code: `quickBot().when("hello").reply("Hi!").react("👋").start();`
        },
        { 
          name: 'Auto-Responses', 
          desc: 'Automatische Antworten auf bestimmte Wörter',
          code: `quickBot().when("hilfe").reply("Wie kann ich helfen?").start();`
        },
        { 
          name: 'Template System', 
          desc: 'Dynamische Nachrichten mit Variablen wie {name}, {time}',
          code: `quickBot().when("info").reply("Hallo {name}! Es ist {time}").start();`
        },
        { 
          name: 'Conditional Logic', 
          desc: 'If-Then Logik für intelligente Antworten',
          code: `quickBot().when("admin").reply((msg) => msg.isFromAdmin() ? "Admin!" : "Kein Admin").start();`
        },
        { 
          name: 'Quick Commands', 
          desc: 'Einfache Commands in einer Zeile erstellen',
          code: `quickBot().command("ping", "Pong!").start();`
        }
      ]
    },
    {
      id: 'multidevice',
      title: '🔥 Multi-Device System',
      description: 'Mehrere WhatsApp Accounts gleichzeitig nutzen',
      items: [
        { 
          name: 'Load Balancing', 
          desc: 'Round-Robin, Random, Least-Used Strategien',
          code: `new MultiClient({ loadBalancing: 'round-robin' });`
        },
        { 
          name: 'Auto Failover', 
          desc: 'Automatisches Umschalten bei Ausfällen',
          code: `new MultiClient({ autoFailover: true });`
        },
        { 
          name: 'Health Monitoring', 
          desc: 'Überwachung aller Devices in Echtzeit',
          code: `const health = multiClient.getHealthStatus();`
        },
        { 
          name: 'Smart Messaging', 
          desc: 'Intelligente Nachrichtenverteilung',
          code: `await multiClient.sendMessage(chatId, "Hello World!");`
        },
        { 
          name: 'Broadcast System', 
          desc: 'Nachrichten an alle Devices gleichzeitig',
          code: `await multiClient.broadcastToAll("System-Nachricht");`
        }
      ]
    },
    {
      id: 'messaging',
      title: '💬 Message System',
      description: 'Vollständiges Nachrichtensystem mit allen WhatsApp Features',
      items: [
        { 
          name: 'Text Messages', 
          desc: 'Einfache und erweiterte Textnachrichten',
          code: `await msg.reply("Hallo Welt!");`
        },
        { 
          name: 'Media Support', 
          desc: 'Bilder, Videos, Audio, Dokumente, Sticker',
          code: `await msg.sendImage("./bild.jpg", "Schönes Bild!");`
        },
        { 
          name: 'Location Sharing', 
          desc: 'GPS-Koordinaten und Standorte senden',
          code: `await msg.sendLocation(52.5200, 13.4050, "Berlin");`
        },
        { 
          name: 'Contact Cards', 
          desc: 'Kontakte als vCard teilen',
          code: `await msg.sendContact({ name: "Max", phone: "+49123456789" });`
        },
        { 
          name: 'Polls & Reactions', 
          desc: 'Umfragen erstellen und Emoji-Reaktionen',
          code: `await msg.sendPoll("Farbe?", ["🔴 Rot", "🔵 Blau"]);`
        }
      ]
    },
    {
      id: 'typing',
      title: '⌨️ Typing Indicator',
      description: 'Realistische Typing-Simulation für menschenähnliche Bots',
      items: [
        { 
          name: 'Visual Typing', 
          desc: 'Typing-Indicator ein/aus schalten',
          code: `await msg.startTyping();`
        },
        { 
          name: 'Realistic Timing', 
          desc: 'Typing-Zeit basierend auf Textlänge',
          code: `await msg.typeRealistic(text);`
        },
        { 
          name: 'Type & Reply', 
          desc: 'Typing + Antwort in einem Befehl',
          code: `await msg.typeAndReply("Hallo! Wie geht es dir?");`
        },
        { 
          name: 'Custom Duration', 
          desc: 'Individuelle Typing-Zeiten einstellen',
          code: `await msg.typeFor(2000);`
        },
        { 
          name: 'Smart Simulation', 
          desc: 'Menschenähnliche Pausen und Rhythmen',
          code: `await msg.humanTyping({ baseSpeed: 100, variance: 0.3 });`
        }
      ]
    },
    {
      id: 'groups',
      title: '👥 Group Management',
      description: 'Vollständige Gruppenverwaltung mit Admin-Features',
      items: [
        { 
          name: 'User Management', 
          desc: 'Hinzufügen, Entfernen, Befördern von Usern',
          code: `await msg.addToGroup(["1234567890@s.whatsapp.net"]);`
        },
        { 
          name: 'Admin Controls', 
          desc: 'Admin-Rechte verwalten und prüfen',
          code: `await msg.promoteToAdmin(["1234567890@s.whatsapp.net"]);`
        },
        { 
          name: 'Group Info', 
          desc: 'Metadaten, Teilnehmer, Admins abrufen',
          code: `const groupInfo = await msg.getGroupInfo();`
        },
        { 
          name: 'Mention System', 
          desc: 'Einzelne User oder alle erwähnen',
          code: `await msg.tagAll("Wichtige Nachricht für alle!");`
        },
        { 
          name: 'Permission Checks', 
          desc: 'Admin-Status und Berechtigungen prüfen',
          code: `if (await msg.isFromAdmin()) { /* Admin-Code */ }`
        }
      ]
    },
    {
      id: 'commands',
      title: '⚡ Command System',
      description: 'Flexibles Command-System mit Chat-spezifischen Prefixes',
      items: [
        { 
          name: 'Custom Prefixes', 
          desc: 'Individuelle Prefixes pro Chat/Gruppe',
          code: `await client.setPrefix(chatId, ">");`
        },
        { 
          name: 'Command Registration', 
          desc: 'Einfache Command-Erstellung',
          code: `client.addCommand("ping", async (msg) => await msg.reply("Pong!"));`
        },
        { 
          name: 'Argument Parsing', 
          desc: 'Automatische Argument-Verarbeitung',
          code: `client.addCommand("echo", async (msg, args) => await msg.reply(args.join(" ")));`
        },
        { 
          name: 'Admin Protection', 
          desc: 'Admin-only Commands automatisch geschützt',
          code: `client.addCommand("kick", { adminOnly: true, handler: async (msg) => {} });`
        },
        { 
          name: 'Command Management', 
          desc: 'Commands hinzufügen, entfernen, auflisten',
          code: `const commands = client.getCommands();`
        }
      ]
    },
    {
      id: 'storage',
      title: '💾 Storage System',
      description: 'Einfaches Datenspeicher-System ohne komplizierte Datenbanken',
      items: [
        { 
          name: 'Simple API', 
          desc: 'write.in("file").set(key, value) - so einfach!',
          code: `client.storage.write.in("users").set("john", { coins: 100 });`
        },
        { 
          name: 'JSON Files', 
          desc: 'Automatische JSON-Dateien, kein Setup nötig',
          code: `const user = client.storage.read.from("users").get("john");`
        },
        { 
          name: 'Nested Keys', 
          desc: 'Verschachtelte Schlüssel wie "user.settings.theme"',
          code: `client.storage.write.in("config").set("user.settings.theme", "dark");`
        },
        { 
          name: 'Array Support', 
          desc: 'Push, Pop, Length für Listen',
          code: `client.storage.write.in("logs").push("User joined");`
        },
        { 
          name: 'Counters', 
          desc: 'Increment/Decrement ohne Lesen/Schreiben',
          code: `client.storage.write.in("stats").increment("messages");`
        }
      ]
    },
    {
      id: 'ai',
      title: '🤖 AI Integration',
      description: 'OpenAI Integration für intelligente Bots',
      items: [
        { 
          name: 'Chat Completion', 
          desc: 'GPT-4 Integration für natürliche Gespräche',
          code: `const response = await client.ai.chat("Erkläre mir JavaScript");`
        },
        { 
          name: 'Smart Replies', 
          desc: 'Kontextbasierte intelligente Antworten',
          code: `const aiResponse = await msg.aiReply();`
        },
        { 
          name: 'Text Analysis', 
          desc: 'Sentiment, Sprache, Toxizität erkennen',
          code: `const sentiment = await client.ai.analyzeSentiment(msg.text);`
        },
        { 
          name: 'Translation', 
          desc: 'Automatische Übersetzung in alle Sprachen',
          code: `const translated = await client.ai.translate(msg.text, "en");`
        },
        { 
          name: 'Content Moderation', 
          desc: 'Automatische Inhaltsmoderation',
          code: `const moderation = await client.ai.moderate(msg.text);`
        }
      ]
    },
    {
      id: 'http',
      title: '🌐 HTTP Client',
      description: 'Integrierter HTTP-Client für externe APIs',
      items: [
        { 
          name: 'Weather API', 
          desc: 'Aktuelle Wetterdaten für jede Stadt weltweit',
          code: `const weather = await client.http.getWeather("Berlin");`
        },
        { 
          name: 'News API', 
          desc: 'Neueste Nachrichten nach Kategorien',
          code: `const news = await client.http.getNews("technology", 5);`
        },
        { 
          name: 'Crypto Prices', 
          desc: 'Live Kryptowährungspreise und Charts',
          code: `const btc = await client.http.getCryptoPrice("bitcoin");`
        },
        { 
          name: 'URL Shortener', 
          desc: 'Lange URLs automatisch kürzen',
          code: `const shortUrl = await client.http.shortenUrl("https://long-url.com");`
        },
        { 
          name: 'Custom Requests', 
          desc: 'GET, POST, PUT, DELETE für eigene APIs',
          code: `const data = await client.http.get("https://api.example.com/data");`
        }
      ]
    },
    {
      id: 'scheduler',
      title: '📅 Scheduler System',
      description: 'Nachrichten planen und automatisch senden',
      items: [
        { 
          name: 'Cron Jobs', 
          desc: 'Wiederkehrende Nachrichten mit Cron-Syntax',
          code: `client.scheduler.cron("0 9 * * *", async () => { /* täglich 9 Uhr */ });`
        },
        { 
          name: 'One-Time Messages', 
          desc: 'Einmalige Nachrichten zu bestimmter Zeit',
          code: `client.scheduler.in(3600000, async () => { /* in 1 Stunde */ });`
        },
        { 
          name: 'Reminders', 
          desc: 'Erinnerungen in X Minuten/Stunden/Tagen',
          code: `await msg.remindIn(30, "minutes", "Meeting startet!");`
        },
        { 
          name: 'Template Variables', 
          desc: 'Dynamische Inhalte mit {time}, {date}, etc.',
          code: `await client.sendTemplateMessage(chatId, "Es ist {time} am {date}");`
        },
        { 
          name: 'Persistent Jobs', 
          desc: 'Jobs überleben Bot-Neustarts',
          code: `client.scheduler.persistentCron("backup", "0 2 * * *", handler);`
        }
      ]
    },
    {
      id: 'waiting',
      title: '⏰ Waiting System',
      description: 'Realistische Pausen für menschenähnliche Gespräche',
      items: [
        { 
          name: 'Message Delays', 
          desc: 'await msg.waiting.after.message(2000) - so einfach!',
          code: `await msg.waiting.after.message(2000);`
        },
        { 
          name: 'Realistic Timing', 
          desc: 'Natürliche Pausen zwischen Nachrichten',
          code: `await msg.reply("Hallo!"); await msg.waiting.after.message(1500);`
        },
        { 
          name: 'Story Mode', 
          desc: 'Perfekt für Geschichten und Tutorials',
          code: `for (const line of story) { await msg.reply(line); await msg.waiting.after.message(3000); }`
        },
        { 
          name: 'Dynamic Delays', 
          desc: 'Zufällige oder berechnete Wartezeiten',
          code: `const delay = msg.text.length * 50; await msg.waiting.after.message(delay);`
        },
        { 
          name: 'Chain Support', 
          desc: 'Mit allen anderen Features kombinierbar',
          code: `quickBot().when("story").reply("Teil 1").wait(2000).reply("Teil 2").start();`
        }
      ]
    },
    {
      id: 'hidetag',
      title: '🎭 Hidetag System',
      description: 'Versteckte Erwähnungen für diskrete Benachrichtigungen',
      items: [
        { 
          name: 'Invisible Mentions', 
          desc: 'Erwähnungen ohne sichtbare @-Tags',
          code: `await msg.reply("Wichtige Nachricht!", [], { hidetag: "all" });`
        },
        { 
          name: 'Group Notifications', 
          desc: 'Alle Mitglieder benachrichtigen ohne Spam',
          code: `await msg.hidetag("📢 Wichtige Ankündigung für alle!");`
        },
        { 
          name: 'Selective Tagging', 
          desc: 'Bestimmte User unsichtbar erwähnen',
          code: `await msg.reply("Admin-Nachricht", [], { hidetag: admins });`
        },
        { 
          name: 'Admin Tools', 
          desc: 'Perfekt für Moderatoren und Ankündigungen',
          code: `await msg.hidetag(\`� Neue Regel von \${msg.getSender()}\`);`
        },
        { 
          name: 'Privacy Mode', 
          desc: 'Diskrete Kommunikation in Gruppen',
          code: `await msg.hidetagSilent("Geheime Info - prüft private Nachrichten");`
        }
      ]
    },
    {
      id: 'stickers',
      title: '🎨 Sticker Creation',
      description: 'Professionelle Sticker-Erstellung mit Sharp Integration',
      items: [
        { 
          name: 'Image to Sticker', 
          desc: 'Bilder automatisch zu Stickern konvertieren',
          code: `await msg.create.sticker.fromImage("./bild.jpg");`
        },
        { 
          name: 'Text Stickers', 
          desc: 'Text in schöne Sticker verwandeln',
          code: `await msg.create.sticker.fromText("Hallo Welt!");`
        },
        { 
          name: 'Animated Support', 
          desc: 'GIFs und Videos zu animierten Stickern',
          code: `await msg.create.sticker.fromGif("./animation.gif");`
        },
        { 
          name: 'Quality Control', 
          desc: 'High/Medium/Low Qualitätsstufen',
          code: `await msg.create.sticker.fromImage("./bild.jpg", { quality: "high" });`
        },
        { 
          name: 'Batch Processing', 
          desc: 'Mehrere Sticker gleichzeitig erstellen',
          code: `await msg.create.sticker.pack([{ type: "image", source: "bild1.jpg" }]);`
        }
      ]
    },
    {
      id: 'recording',
      title: '🎤 Visual Recording',
      description: 'Recording-Indicator für realistische Sprachnachrichten-Simulation',
      items: [
        { 
          name: 'Recording Indicator', 
          desc: 'Echter WhatsApp Recording-Status',
          code: `await msg.startRecording();`
        },
        { 
          name: 'Realistic Duration', 
          desc: 'Recording-Zeit basierend auf Nachrichtenlänge',
          code: `await msg.recordRealistic(text);`
        },
        { 
          name: 'Voice Simulation', 
          desc: 'Sprachnachrichten-Feeling ohne Audio',
          code: `await msg.recordAndReply("Das wäre eine Sprachnachricht!");`
        },
        { 
          name: 'Combined Actions', 
          desc: 'Recording + Typing + Waiting kombinieren',
          code: `await msg.startRecording(); await msg.waiting.after.message(2000);`
        },
        { 
          name: 'Auto Timing', 
          desc: 'Intelligente Recording-Zeiten',
          code: `await msg.visualRecord({ baseTime: 2000, realistic: true });`
        }
      ]
    },
    {
      id: 'plugins',
      title: '🔌 Plugin System',
      description: '8 fertige Plugins mit 80+ Commands - optional ladbar',
      items: [
        { 
          name: 'Economy System', 
          desc: 'Coins, Shop, Daily Rewards, Gambling, Leaderboard',
          code: `await client.load.Plugins('economy-system'); // !balance, !daily, !shop`
        },
        { 
          name: 'Games Plugin', 
          desc: 'Würfel, Quiz, Schere-Stein-Papier, 8-Ball, Memory',
          code: `await client.load.Plugins('games-plugin'); // !dice, !rps, !quiz`
        },
        { 
          name: 'Music Plugin', 
          desc: 'YouTube Suche, Lyrics, Playlists, Charts, Spotify',
          code: `await client.load.Plugins('music-plugin'); // !play, !lyrics, !charts`
        },
        { 
          name: 'Travel Plugin', 
          desc: 'Wetter, Flüge, Hotels, Währungen, Übersetzung',
          code: `await client.load.Plugins('travel-plugin'); // !weather, !flights, !hotels`
        },
        { 
          name: 'Education Plugin', 
          desc: 'Wikipedia, Mathe, Code-Erklärung, Definitionen',
          code: `await client.load.Plugins('education-plugin'); // !wiki, !math, !define`
        },
        { 
          name: 'Moderation Plugin', 
          desc: 'Auto-Mod, Warns, Kicks, Bans, Anti-Spam',
          code: `await client.load.Plugins('moderation-plugin'); // !warn, !kick, !ban`
        },
        { 
          name: 'Creative Plugin', 
          desc: 'Memes, ASCII-Art, Witze, Zitate, Inspiration',
          code: `await client.load.Plugins('creative-plugin'); // !meme, !joke, !ascii`
        },
        { 
          name: 'Analytics Plugin', 
          desc: 'Statistiken, Heatmaps, Top-User, Insights',
          code: `await client.load.Plugins('analytics-plugin'); // !stats, !topusers`
        }
      ]
    },
    {
      id: 'authentication',
      title: '🔐 Authentication',
      description: 'Einmalige Einrichtung, dann immer automatisch verbunden',
      items: [
        { 
          name: 'One-Time Setup', 
          desc: 'Einmal QR-Code scannen, dann immer auto-connect',
          code: `const client = new WhatsAppClient({ authDir: './auth' });`
        },
        { 
          name: 'Browser Integration', 
          desc: 'QR-Code öffnet automatisch im Browser',
          code: `new WhatsAppClient({ qrInBrowser: true, browserPort: 3000 });`
        },
        { 
          name: 'Terminal Fallback', 
          desc: 'QR-Code im Terminal falls Browser nicht geht',
          code: `new WhatsAppClient({ printQR: true, fallbackToTerminal: true });`
        },
        { 
          name: 'Auto Reconnect', 
          desc: 'Automatische Wiederverbindung bei Unterbrechungen',
          code: `new WhatsAppClient({ autoReconnect: true, maxReconnectAttempts: 10 });`
        },
        { 
          name: 'Session Management', 
          desc: 'Backup, Repair, Cleanup von Sessions',
          code: `await client.session.backup('./backup/'); await client.session.repair();`
        }
      ]
    },
    {
      id: 'statistics',
      title: '📊 Statistics System',
      description: 'Detaillierte Statistiken über Bot-Nutzung und User-Aktivität',
      items: [
        { 
          name: 'Message Stats', 
          desc: 'Nachrichten-Counts, heute, diese Woche, gesamt',
          code: `const stats = await client.stats.getMessageStats();`
        },
        { 
          name: 'User Activity', 
          desc: 'Aktivste User, letzte Aktivität, Online-Status',
          code: `const topUsers = await client.stats.getTopUsers(10);`
        },
        { 
          name: 'Group Analytics', 
          desc: 'Gruppen-Statistiken, Member-Counts, Admins',
          code: `const groupStats = await client.stats.getGroupStats(groupId);`
        },
        { 
          name: 'Command Usage', 
          desc: 'Meist genutzte Commands und Funktionen',
          code: `const cmdStats = await client.stats.getCommandStats();`
        },
        { 
          name: 'Heatmaps', 
          desc: 'Aktivitätsmuster nach Stunden und Tagen',
          code: `const heatmap = await client.stats.getActivityHeatmap();`
        }
      ]
    },
    {
      id: 'events',
      title: '🎧 Event System',
      description: 'Umfassendes Event-System für alle WhatsApp-Ereignisse',
      items: [
        { 
          name: 'Message Events', 
          desc: 'Auf alle Nachrichten-Typen reagieren',
          code: `client.on('message', async (msg) => { /* Handle message */ });`
        },
        { 
          name: 'Group Events', 
          desc: 'User joins, leaves, Admin-Änderungen',
          code: `client.on('group-join', async (notification) => { /* User joined */ });`
        },
        { 
          name: 'Connection Events', 
          desc: 'Connect, Disconnect, Reconnect Events',
          code: `client.on('connected', () => console.log('Bot online!'));`
        },
        { 
          name: 'Presence Events', 
          desc: 'Online, Offline, Typing, Recording Status',
          code: `client.on('presence-update', (update) => { /* Presence changed */ });`
        },
        { 
          name: 'Custom Events', 
          desc: 'Eigene Events erstellen und emittieren',
          code: `client.emit('user-level-up', { userId, newLevel, chatId });`
        }
      ]
    },
    {
      id: 'utilities',
      title: '🔧 Utility Functions',
      description: 'Nützliche Hilfsfunktionen für alle Situationen',
      items: [
        { 
          name: 'Connection Management', 
          desc: 'Connect, Disconnect, Status prüfen',
          code: `await client.connect(); const isConnected = client.isConnected();`
        },
        { 
          name: 'Message Type Detection', 
          desc: 'Automatische Erkennung von Nachrichtentypen',
          code: `if (msg.isText()) { /* Text */ } if (msg.isImage()) { /* Bild */ }`
        },
        { 
          name: 'Presence Control', 
          desc: 'Online, Offline, Typing, Recording Status setzen',
          code: `await client.setPresence('available'); await client.setPresence('composing', chatId);`
        },
        { 
          name: 'QR Code Generation', 
          desc: 'QR-Codes für beliebige Inhalte erstellen',
          code: `const qrBuffer = await client.utils.generateQR("Hallo Welt!");`
        },
        { 
          name: 'Error Handling', 
          desc: 'Robuste Fehlerbehandlung in allen Bereichen',
          code: `client.on('error', (error) => console.error('Bot-Fehler:', error));`
        }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>WAEngine Features - Alle 200+ Funktionen im Überblick</title>
        <meta name="description" content="Entdecke alle 200+ Features von WAEngine - der mächtigsten WhatsApp Bot Library mit EasyBot, Multi-Device, AI Integration und Plugin System." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">WAEngine Features</h1>
                <p className="text-gray-600 mt-2">Alle 200+ Funktionen der mächtigsten WhatsApp Bot Library</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">200+</div>
                <div className="text-sm text-gray-500">Features</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sticky Table of Contents */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-8">
                <div className="bg-white rounded-xl shadow-lg border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Inhaltsverzeichnis</h2>
                  <nav className="space-y-2">
                    {features.map((feature) => (
                      <button
                        key={feature.id}
                        onClick={() => scrollToSection(feature.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          activeSection === feature.id
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{feature.title.split(' ')[0]}</span>
                          <span className="truncate">{feature.title.substring(feature.title.indexOf(' ') + 1)}</span>
                        </div>
                      </button>
                    ))}
                  </nav>
                  
                  {/* Quick Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">20</div>
                        <div className="text-xs text-gray-500">Kategorien</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">200+</div>
                        <div className="text-xs text-gray-500">Funktionen</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8 mb-8">
                <h2 className="text-2xl font-bold mb-4">🚀 Die kompletteste WhatsApp Bot Library</h2>
                <p className="text-blue-100 mb-6">
                  Von 3-Zeilen EasyBot bis zu Enterprise Multi-Device Systemen - WAEngine bietet alles was du brauchst!
                </p>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold">3</div>
                    <div className="text-blue-200 text-sm">APIs in einem</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">8</div>
                    <div className="text-blue-200 text-sm">Fertige Plugins</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">80+</div>
                    <div className="text-blue-200 text-sm">Plugin Commands</div>
                  </div>
                </div>
              </div>

              {/* Feature Sections */}
              <div className="space-y-8">
                {features.map((feature) => (
                  <section key={feature.id} id={feature.id} className="scroll-mt-8">
                    <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
                      {/* Section Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                        <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                        <p className="text-gray-600 mt-1">{feature.description}</p>
                      </div>

                      {/* Feature Items */}
                      <div className="p-6">
                        <div className="grid gap-4">
                          {feature.items.map((item, index) => (
                            <div key={index} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                              <div className="flex items-start gap-4 mb-3">
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                  <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
                                </div>
                              </div>
                              {item.code && (
                                <div className="mt-3 bg-gray-900 rounded-lg p-3 overflow-x-auto">
                                  <pre className="text-green-400 font-mono text-xs whitespace-pre-wrap">
                                    {item.code}
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="mt-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Bereit loszulegen? 🚀</h3>
                <p className="text-green-100 mb-6">
                  Installiere WAEngine und erstelle deinen ersten Bot in unter 3 Zeilen Code!
                </p>
                <div className="bg-black bg-opacity-20 rounded-lg p-4 text-left font-mono text-sm">
                  <div className="text-green-300">npm install waengine</div>
                  <div className="text-blue-300 mt-2">import &#123; quickBot &#125; from "waengine";</div>
                  <div className="text-yellow-300 mt-1">quickBot().when("hello").reply("Hi! 👋").start();</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}