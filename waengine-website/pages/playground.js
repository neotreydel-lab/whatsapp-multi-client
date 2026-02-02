import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Play, 
  Copy, 
  Check, 
  Code, 
  Zap, 
  BookOpen,
  Lightbulb,
  Download,
  RefreshCw
} from 'lucide-react';

export default function PlaygroundPage() {
  const [selectedExample, setSelectedExample] = useState('easybot');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const examples = {
    easybot: {
      title: 'EasyBot - 3 Zeilen Bot',
      description: 'Der einfachste Weg einen WhatsApp Bot zu erstellen',
      code: `import { quickBot } from "waengine";

// 3-Zeilen Bot - Perfekt für Anfänger
quickBot()
    .when("hello").reply("Hi! 👋 Wie kann ich dir helfen?")
    .when("help").reply("Verfügbare Commands:\\n• hello - Begrüßung\\n• help - Diese Hilfe\\n• time - Aktuelle Zeit")
    .when("time").reply(() => "🕐 Aktuelle Zeit: " + new Date().toLocaleString('de-DE'))
    .start();

console.log("✅ EasyBot gestartet!");`,
      output: `🔌 WAEngine startet...
✅ WhatsApp verbunden!
✅ EasyBot gestartet!

📱 QR-Code wird angezeigt...
🎯 Bot bereit für Nachrichten!

Beispiel-Nachrichten:
📨 "hello" → "Hi! 👋 Wie kann ich dir helfen?"
📨 "help" → Zeigt verfügbare Commands
📨 "time" → Zeigt aktuelle Zeit`
    },
    
    advanced: {
      title: 'Advanced API - Vollständige Kontrolle',
      description: 'Professionelle Bot-Entwicklung mit allen Features',
      code: `import { WhatsAppClient } from "waengine";

const client = new WhatsAppClient({
    printQR: true,
    browser: ['MeinBot', 'Chrome', '1.0.0']
});

// Event-Handler registrieren
client.on('connected', () => {
    console.log('🚀 Bot ist online!');
});

client.on('message', async (msg) => {
    const text = msg.text;
    const sender = msg.getSender();
    
    console.log(\`📨 Nachricht von \${sender}: "\${text}"\`);
    
    // Command-System
    if (text === '!ping') {
        await msg.reply('🏓 Pong!');
    }
    
    if (text === '!info') {
        const info = \`ℹ️ **Bot Information**
        
👤 Sender: \${sender}
📱 Chat: \${msg.isGroup ? 'Gruppe' : 'Privat'}
🕐 Zeit: \${new Date().toLocaleString('de-DE')}
🤖 WAEngine v1.0.9\`;
        
        await msg.reply(info);
    }
    
    if (text.startsWith('!echo ')) {
        const message = text.substring(6);
        await msg.reply(\`🔊 Echo: \${message}\`);
    }
});

// Bot starten
client.connect();`,
      output: `💾 WAStorage initialisiert: ./waengine-data
🌐 HTTP Client initialisiert
📅 Scheduler initialisiert
🔌 WAEngine startet...
✅ WhatsApp verbunden!
🚀 Bot ist online!

📝 Verfügbare Commands:
• !ping - Pong antworten
• !info - Bot-Informationen
• !echo <text> - Text wiederholen

🎯 Bot bereit für erweiterte Funktionen!`
    },
    
    plugins: {
      title: 'Plugin System - Modulare Erweiterungen',
      description: 'Optionales Plugin-Loading für spezielle Features',
      code: `import { WhatsAppClient } from "waengine";

const client = new WhatsAppClient();

client.on('connected', async () => {
    console.log('🔌 Lade Plugins...');
    
    // Einzelne Plugins laden
    await client.load.Plugins('economy-system');
    await client.load.Plugins('games-plugin');
    await client.load.Plugins('creative-plugin');
    
    // Oder alle auf einmal:
    // await client.load.Plugins('all');
    
    console.log('✅ Plugins geladen!');
    
    const stats = client.plugins.getStats();
    console.log(\`📊 \${stats.loaded}/\${stats.available} Plugins aktiv\`);
});

client.on('message', async (msg) => {
    const text = msg.text;
    
    // Plugin-Commands werden automatisch behandelt
    if (text === '!plugins') {
        const stats = client.plugins.getStats();
        
        const pluginList = \`🔌 **Geladene Plugins**
        
✅ \${stats.loaded}/\${stats.available} Plugins aktiv
📋 Plugins: \${stats.plugins.join(', ')}

💰 Economy: !balance, !daily, !shop
🎮 Games: !dice, !rps, !quiz
🎨 Creative: !meme, !joke, !ascii\`;
        
        await msg.reply(pluginList);
    }
});

client.connect();`,
      output: `🔌 WAEngine startet...
✅ WhatsApp verbunden!
🔌 Lade Plugins...
🔌 Lade Plugin: economy-system
✅ Plugin geladen: economy-system v1.0.0
🔌 Lade Plugin: games-plugin
✅ Plugin geladen: games-plugin v1.0.0
🔌 Lade Plugin: creative-plugin
✅ Plugin geladen: creative-plugin v1.0.0
✅ Plugins geladen!
📊 3/8 Plugins aktiv

🎯 80+ Plugin-Commands verfügbar:
💰 !balance, !daily, !shop, !work...
🎮 !dice, !rps, !quiz, !number...
🎨 !meme, !joke, !ascii, !qr...`
    },
    
    multidevice: {
      title: 'Multi-Device - Mehrere Accounts',
      description: 'Bis zu 3 WhatsApp Accounts gleichzeitig verwalten',
      code: `import { MultiClient } from "waengine";

const multiClient = new MultiClient({
    accounts: [
        { name: 'Bot1', authDir: './auth1' },
        { name: 'Bot2', authDir: './auth2' },
        { name: 'Bot3', authDir: './auth3' }
    ],
    loadBalancing: 'round-robin', // 'random', 'least-used'
    autoFailover: true
});

// Event-Handler für alle Clients
multiClient.on('connected', (clientName) => {
    console.log(\`✅ \${clientName} verbunden!\`);
});

multiClient.on('message', async (msg, clientName) => {
    console.log(\`📨 [\${clientName}] Nachricht: "\${msg.text}"\`);
    
    if (msg.text === '!status') {
        const status = multiClient.getStatus();
        
        const statusText = \`📊 **Multi-Device Status**
        
🔌 Aktive Clients: \${status.connected}/\${status.total}
⚖️ Load Balancing: \${status.strategy}
🔄 Auto-Failover: \${status.autoFailover ? 'An' : 'Aus'}

📱 Clients:
\${status.clients.map(c => 
    \`\${c.connected ? '✅' : '❌'} \${c.name}\`
).join('\\n')}\`;
        
        await msg.reply(statusText);
    }
});

// Alle Clients starten
multiClient.startAll();`,
      output: `🔌 MultiClient startet...
🔌 Starte Bot1...
🔌 Starte Bot2...
🔌 Starte Bot3...

✅ Bot1 verbunden!
✅ Bot2 verbunden!
✅ Bot3 verbunden!

⚖️ Load Balancing: round-robin
🔄 Auto-Failover aktiviert

📊 Status: 3/3 Clients online
🎯 Multi-Device System bereit!

Nachrichten werden automatisch auf alle Clients verteilt.`
    }
  };

  useEffect(() => {
    setCode(examples[selectedExample].code);
    setOutput(examples[selectedExample].output);
  }, [selectedExample]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('🔄 Code wird ausgeführt...\n\n');
    
    // Simuliere Code-Ausführung
    setTimeout(() => {
      setOutput(examples[selectedExample].output);
      setIsRunning(false);
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>Code Playground - WAEngine</title>
        <meta name="description" content="Teste WAEngine Code live im Browser. Interaktive Beispiele für EasyBot, Advanced API und Plugin-System." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">WAEngine</span>
              </Link>
              
              <nav className="flex items-center space-x-6">
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
                <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </Link>
                <Link href="/plugins" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Plugins
                </Link>
                <Link href="/community" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Community
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                <Code className="w-4 h-4 mr-2" />
                Interactive Code Editor
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Code <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Playground</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Teste WAEngine Code live im Browser. Lerne durch interaktive Beispiele 
              und experimentiere mit verschiedenen Features.
            </p>
          </div>
        </section>

        {/* Playground */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Example Selector */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-4 justify-center">
                {Object.entries(examples).map(([key, example]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedExample(key)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      selectedExample === key
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {example.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Example Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {examples[selectedExample].title}
                  </h2>
                  <p className="text-gray-600">
                    {examples[selectedExample].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Code Editor & Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Code Editor */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Code className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">Code Editor</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(code)}
                        className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copied ? 'Kopiert!' : 'Kopieren'}</span>
                      </button>
                      <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        <span>{isRunning ? 'Läuft...' : 'Ausführen'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-96 font-mono text-sm bg-gray-900 text-white p-4 rounded-lg border-0 resize-none focus:ring-2 focus:ring-green-500"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Output */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">Console Output</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <pre className="w-full h-96 font-mono text-sm bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
                    {output}
                  </pre>
                </div>
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <Download className="w-6 h-6 text-green-600" />
                <h3 className="text-2xl font-bold text-gray-900">Lokale Installation</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Um diese Beispiele lokal auszuführen, installiere WAEngine in deinem Projekt:
              </p>
              
              <div className="bg-gray-900 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-green-400 font-mono text-sm">Terminal</span>
                  <button
                    onClick={() => copyToClipboard('npm install waengine')}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <code className="text-white font-mono">npm install waengine</code>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">1️⃣</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Installation</h4>
                  <p className="text-sm text-gray-600">WAEngine via npm installieren</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">2️⃣</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Code kopieren</h4>
                  <p className="text-sm text-gray-600">Beispiel-Code in deine Datei einfügen</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">3️⃣</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Bot starten</h4>
                  <p className="text-sm text-gray-600">QR-Code scannen und loslegen</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}