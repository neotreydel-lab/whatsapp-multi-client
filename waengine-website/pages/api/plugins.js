// Plugin-Daten für Plugin Explorer
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const plugins = [
    {
      id: 'economy-system',
      name: 'Economy System',
      description: 'Vollständiges Wirtschaftssystem mit Coins, Shop und Daily Rewards',
      icon: '💰',
      category: 'Gaming',
      version: '1.0.0',
      commands: [
        { name: 'balance', description: 'Kontostand anzeigen', usage: '!balance' },
        { name: 'daily', description: 'Tägliche Belohnung abholen', usage: '!daily' },
        { name: 'shop', description: 'Shop mit Items anzeigen', usage: '!shop' },
        { name: 'work', description: 'Arbeiten gehen für Coins', usage: '!work' },
        { name: 'pay', description: 'Geld an User überweisen', usage: '!pay @user 100' },
        { name: 'buy', description: 'Item aus Shop kaufen', usage: '!buy 1' },
        { name: 'inventory', description: 'Inventar anzeigen', usage: '!inventory' },
        { name: 'leaderboard', description: 'Reichste User anzeigen', usage: '!leaderboard' },
        { name: 'gamble', description: 'Glücksspiel spielen', usage: '!gamble 50' },
        { name: 'rob', description: 'User berauben (Risiko!)', usage: '!rob @user' }
      ],
      features: [
        'Persistent Coin System',
        'Daily Rewards',
        'Item Shop',
        'User Trading',
        'Gambling Games',
        'Leaderboards'
      ],
      codeExample: `// Economy System laden
await client.load.Plugins('economy-system');

client.on('message', async (msg) => {
  if (msg.text === '!balance') {
    // Automatisch vom Plugin behandelt
  }
});`
    },
    
    {
      id: 'games-plugin',
      name: 'Games Plugin',
      description: 'Interaktive Spiele für Gruppen und private Chats',
      icon: '🎮',
      category: 'Entertainment',
      version: '1.0.0',
      commands: [
        { name: 'dice', description: 'Würfel werfen', usage: '!dice' },
        { name: 'rps', description: 'Schere-Stein-Papier', usage: '!rps schere' },
        { name: 'quiz', description: 'Quiz starten', usage: '!quiz' },
        { name: 'number', description: 'Zahlenraten-Spiel', usage: '!number' },
        { name: 'trivia', description: 'Trivia-Fragen', usage: '!trivia' },
        { name: 'hangman', description: 'Galgenmännchen spielen', usage: '!hangman' },
        { name: 'riddle', description: 'Rätsel lösen', usage: '!riddle' },
        { name: 'memory', description: 'Memory-Spiel', usage: '!memory' },
        { name: 'math', description: 'Mathe-Quiz', usage: '!math' },
        { name: 'wordchain', description: 'Wortkette spielen', usage: '!wordchain' }
      ],
      features: [
        'Multiplayer Games',
        'Score Tracking',
        'Difficulty Levels',
        'Group Competitions',
        'Achievement System',
        'Game Statistics'
      ],
      codeExample: `// Games Plugin laden
await client.load.Plugins('games-plugin');

// Automatische Spiel-Commands verfügbar
// !dice, !rps, !quiz, etc.`
    },

    {
      id: 'music-plugin',
      name: 'Music Plugin',
      description: 'Musik-Suche und Playlist-Management',
      icon: '🎵',
      category: 'Media',
      version: '1.0.0',
      commands: [
        { name: 'play', description: 'Musik auf YouTube suchen', usage: '!play despacito' },
        { name: 'lyrics', description: 'Songtexte finden', usage: '!lyrics hello adele' },
        { name: 'playlist', description: 'Playlist verwalten', usage: '!playlist' },
        { name: 'radio', description: 'Online Radio hören', usage: '!radio' },
        { name: 'spotify', description: 'Spotify Integration', usage: '!spotify' },
        { name: 'soundcloud', description: 'SoundCloud Suche', usage: '!soundcloud' },
        { name: 'charts', description: 'Aktuelle Charts', usage: '!charts' },
        { name: 'artist', description: 'Künstler-Informationen', usage: '!artist eminem' },
        { name: 'album', description: 'Album-Informationen', usage: '!album thriller' },
        { name: 'genre', description: 'Genre erkunden', usage: '!genre rock' }
      ],
      features: [
        'YouTube Integration',
        'Lyrics Search',
        'Playlist Management',
        'Artist Information',
        'Music Charts',
        'Genre Discovery'
      ],
      codeExample: `// Music Plugin laden
await client.load.Plugins('music-plugin');

// Musik-Commands verfügbar
// !play, !lyrics, !playlist, etc.`
    },

    {
      id: 'travel-plugin',
      name: 'Travel Plugin',
      description: 'Reise-Informationen und Wetter-Service',
      icon: '✈️',
      category: 'Utility',
      version: '1.0.0',
      commands: [
        { name: 'weather', description: 'Wetter abfragen', usage: '!weather Berlin' },
        { name: 'flight', description: 'Flüge suchen', usage: '!flight MUC BER' },
        { name: 'hotel', description: 'Hotels finden', usage: '!hotel Berlin' },
        { name: 'currency', description: 'Währung umrechnen', usage: '!currency EUR USD' },
        { name: 'translate', description: 'Text übersetzen', usage: '!translate hallo en' },
        { name: 'timezone', description: 'Zeitzone anzeigen', usage: '!timezone Berlin' },
        { name: 'distance', description: 'Entfernung berechnen', usage: '!distance Berlin München' },
        { name: 'country', description: 'Länder-Informationen', usage: '!country Germany' },
        { name: 'city', description: 'Stadt-Informationen', usage: '!city Berlin' },
        { name: 'map', description: 'Karte anzeigen', usage: '!map Berlin' }
      ],
      features: [
        'Weather API',
        'Flight Search',
        'Hotel Booking',
        'Currency Converter',
        'Translation Service',
        'Geographic Data'
      ],
      codeExample: `// Travel Plugin laden
await client.load.Plugins('travel-plugin');

// Reise-Commands verfügbar
// !weather, !flight, !hotel, etc.`
    },

    {
      id: 'education-plugin',
      name: 'Education Plugin',
      description: 'Lern-Tools und Wissens-Datenbank',
      icon: '📚',
      category: 'Education',
      version: '1.0.0',
      commands: [
        { name: 'wiki', description: 'Wikipedia-Suche', usage: '!wiki JavaScript' },
        { name: 'math', description: 'Mathe-Rechner', usage: '!math 2+2*3' },
        { name: 'code', description: 'Code erklären', usage: '!code console.log()' },
        { name: 'define', description: 'Wort definieren', usage: '!define programming' },
        { name: 'synonym', description: 'Synonyme finden', usage: '!synonym happy' },
        { name: 'grammar', description: 'Grammatik-Check', usage: '!grammar' },
        { name: 'spell', description: 'Rechtschreibung prüfen', usage: '!spell' },
        { name: 'fact', description: 'Zufällige Fakten', usage: '!fact' },
        { name: 'quote', description: 'Inspirierende Zitate', usage: '!quote' },
        { name: 'learn', description: 'Lern-Ressourcen', usage: '!learn javascript' }
      ],
      features: [
        'Wikipedia Integration',
        'Math Calculator',
        'Code Explanation',
        'Dictionary & Thesaurus',
        'Grammar Tools',
        'Learning Resources'
      ],
      codeExample: `// Education Plugin laden
await client.load.Plugins('education-plugin');

// Lern-Commands verfügbar
// !wiki, !math, !code, etc.`
    },

    {
      id: 'moderation-plugin',
      name: 'Moderation Plugin',
      description: 'Gruppen-Moderation und Auto-Moderation',
      icon: '🛡️',
      category: 'Moderation',
      version: '1.0.0',
      commands: [
        { name: 'automod', description: 'Auto-Moderation aktivieren', usage: '!automod on' },
        { name: 'warn', description: 'User warnen', usage: '!warn @user spam' },
        { name: 'rules', description: 'Regeln anzeigen', usage: '!rules' },
        { name: 'mute', description: 'User stumm schalten', usage: '!mute @user 10m' },
        { name: 'ban', description: 'User bannen', usage: '!ban @user' },
        { name: 'kick', description: 'User kicken', usage: '!kick @user' },
        { name: 'promote', description: 'User befördern', usage: '!promote @user' },
        { name: 'demote', description: 'Admin entfernen', usage: '!demote @user' },
        { name: 'antilink', description: 'Link-Schutz aktivieren', usage: '!antilink on' },
        { name: 'antispam', description: 'Spam-Schutz aktivieren', usage: '!antispam on' }
      ],
      features: [
        'Auto-Moderation',
        'Warning System',
        'Spam Protection',
        'Link Filtering',
        'User Management',
        'Rule Enforcement'
      ],
      codeExample: `// Moderation Plugin laden
await client.load.Plugins('moderation-plugin');

// Moderation-Commands verfügbar
// !automod, !warn, !rules, etc.`
    },

    {
      id: 'creative-plugin',
      name: 'Creative Plugin',
      description: 'Kreative Tools für Memes, ASCII-Art und mehr',
      icon: '🎨',
      category: 'Creative',
      version: '1.0.0',
      commands: [
        { name: 'meme', description: 'Meme erstellen', usage: '!meme 1 Programmieren' },
        { name: 'joke', description: 'Witz erzählen', usage: '!joke' },
        { name: 'ascii', description: 'ASCII-Art erstellen', usage: '!ascii heart' },
        { name: 'qr', description: 'QR-Code generieren', usage: '!qr Hello World' },
        { name: 'color', description: 'Farb-Informationen', usage: '!color #FF0000' },
        { name: 'logo', description: 'Logo erstellen', usage: '!logo WAEngine' },
        { name: 'banner', description: 'Banner erstellen', usage: '!banner Welcome' },
        { name: 'sticker', description: 'Sticker erstellen', usage: '!sticker' },
        { name: 'gif', description: 'GIF suchen', usage: '!gif search cats' },
        { name: 'emoji', description: 'Emoji-Informationen', usage: '!emoji 😀' }
      ],
      features: [
        'Meme Generator',
        'ASCII Art',
        'QR Code Generator',
        'Color Tools',
        'Logo Creation',
        'Sticker Maker'
      ],
      codeExample: `// Creative Plugin laden
await client.load.Plugins('creative-plugin');

// Creative-Commands verfügbar
// !meme, !joke, !ascii, etc.`
    },

    {
      id: 'analytics-plugin',
      name: 'Analytics Plugin',
      description: 'Bot-Statistiken und User-Analytics',
      icon: '📊',
      category: 'Analytics',
      version: '1.0.0',
      commands: [
        { name: 'mystats', description: 'Eigene Statistiken', usage: '!mystats' },
        { name: 'topusers', description: 'Aktivste User', usage: '!topusers' },
        { name: 'heatmap', description: 'Aktivitätsmuster', usage: '!heatmap' },
        { name: 'globalstats', description: 'Globale Statistiken', usage: '!globalstats' },
        { name: 'commands', description: 'Command-Statistiken', usage: '!commands' },
        { name: 'usage', description: 'Bot-Nutzung anzeigen', usage: '!usage' },
        { name: 'growth', description: 'Wachstums-Statistiken', usage: '!growth' },
        { name: 'export', description: 'Daten exportieren', usage: '!export' },
        { name: 'report', description: 'Detaillierter Report', usage: '!report' },
        { name: 'insights', description: 'Tiefe Einblicke', usage: '!insights' }
      ],
      features: [
        'User Analytics',
        'Command Statistics',
        'Activity Heatmaps',
        'Growth Tracking',
        'Data Export',
        'Custom Reports'
      ],
      codeExample: `// Analytics Plugin laden
await client.load.Plugins('analytics-plugin');

// Analytics-Commands verfügbar
// !mystats, !topusers, !heatmap, etc.`
    }
  ];

  // Cache-Header setzen
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
  
  return res.status(200).json({
    plugins,
    total: plugins.length,
    categories: [...new Set(plugins.map(p => p.category))],
    totalCommands: plugins.reduce((sum, p) => sum + p.commands.length, 0)
  });
}