import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Download, 
  Star, 
  Code, 
  Zap, 
  Shield, 
  Users, 
  Package, 
  GitBranch,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  Calendar,
  Globe
} from 'lucide-react';

export default function Home() {
  const [npmStats, setNpmStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchNpmStats();
    // Aktualisiere Stats alle 5 Minuten
    const interval = setInterval(fetchNpmStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNpmStats = async () => {
    try {
      const response = await fetch('/api/npm-stats');
      const data = await response.json();
      setNpmStats(data);
    } catch (error) {
      console.error('Error fetching NPM stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Head>
        <title>WAEngine - Die mächtigste WhatsApp Bot Library</title>
        <meta name="description" content="🚀 WAEngine - Multi-Device WhatsApp Bot Library mit EasyBot API, Plugin-System und 165+ Features" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="WAEngine - WhatsApp Bot Library" />
        <meta property="og:description" content="Die mächtigste WhatsApp Bot Library mit Multi-Device Support & Plugin-System" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">WAEngine</h1>
                  <p className="text-sm text-gray-600">WhatsApp Bot Library</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link 
                  href="/features"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Features
                </Link>
                <Link 
                  href="/playground"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Playground
                </Link>
                <Link 
                  href="/plugins"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Plugins
                </Link>
                <Link 
                  href="/community"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Community
                </Link>
                <a 
                  href="https://github.com/neotreydel-lab/whatsapp-multi-client" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <GitBranch className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                <Package className="w-4 h-4 mr-2" />
                Version {npmStats?.version || '1.0.9'} verfügbar
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                WAEngine
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Die mächtigste WhatsApp Bot Library mit Multi-Device Support, 
              Plugin-System und 165+ Features
            </p>

            {/* Installation */}
            <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl mx-auto mb-12">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-400 font-mono text-sm">Installation</span>
                <button
                  onClick={() => copyToClipboard('npm install waengine')}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span className="text-sm">{copied ? 'Kopiert!' : 'Kopieren'}</span>
                </button>
              </div>
              <code className="text-white font-mono text-lg">npm install waengine</code>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/features"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Code className="w-5 h-5 mr-2" />
                Alle Features
              </Link>
              
              <Link 
                href="/playground"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
              >
                <Code className="w-5 h-5 mr-2" />
                Code testen
              </Link>
              
              <Link 
                href="/plugins"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
              >
                <Package className="w-5 h-5 mr-2" />
                Plugins entdecken
              </Link>
              
              <Link 
                href="/community"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
              >
                <Users className="w-5 h-5 mr-2" />
                Community
              </Link>
            </div>
            {!loading && npmStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-green-100">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                    <Download className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatNumber(npmStats.downloads?.monthly)}
                  </div>
                  <div className="text-sm text-gray-600">Downloads/Monat</div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatNumber(npmStats.downloads?.weekly)}
                  </div>
                  <div className="text-sm text-gray-600">Downloads/Woche</div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {npmStats.versions?.total || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Versionen</div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-orange-100">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {npmStats.calculated?.avgDownloadsPerDay || 0}
                  </div>
                  <div className="text-sm text-gray-600">Downloads/Tag</div>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-center mb-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Warum WAEngine?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Die einzige WhatsApp Bot Library, die du jemals brauchen wirst
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">EasyBot API</h3>
                <p className="text-gray-600 mb-4">
                  Bot in 3 Zeilen Code erstellen. Perfekt für Anfänger mit jQuery-Style Chaining.
                </p>
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  quickBot().when("hello").reply("Hi!").start()
                </code>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Device</h3>
                <p className="text-gray-600 mb-4">
                  Bis zu 3 WhatsApp Accounts gleichzeitig mit Load-Balancing und Failover.
                </p>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Round-Robin</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Auto-Failover</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Plugin-System</h3>
                <p className="text-gray-600 mb-4">
                  8 optionale Plugins mit 80+ Commands. Economy, Games, AI, Analytics und mehr.
                </p>
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  await client.load.Plugins('all')
                </code>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Production Ready</h3>
                <p className="text-gray-600 mb-4">
                  Session-Management, Auto-Reconnect, Error-Handling und Performance-Optimierung.
                </p>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Stable</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Secure</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                  <Code className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">165+ Features</h3>
                <p className="text-gray-600 mb-4">
                  Alles was du brauchst: Commands, Groups, Media, AI, HTTP, Scheduler, Storage und mehr.
                </p>
                <div className="text-sm text-gray-500">
                  Message • Groups • Commands • AI • HTTP • Storage • Scheduler • Plugins
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Open Source</h3>
                <p className="text-gray-600 mb-4">
                  MIT License, aktive Community und regelmäßige Updates. Komplett kostenlos.
                </p>
                <a 
                  href="https://github.com/neotreydel-lab/whatsapp-multi-client" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  GitHub Repository
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Quick Start
              </h2>
              <p className="text-xl text-gray-600">
                In wenigen Minuten zum ersten Bot
              </p>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-green-400 font-mono">Einfachster Bot (3 Zeilen)</span>
                <button
                  onClick={() => copyToClipboard(`import { quickBot } from "waengine";

quickBot()
    .when("hello").reply("Hi! 👋")
    .when("help").reply("Ich kann dir helfen!")
    .start();`)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="text-white font-mono text-sm overflow-x-auto">
{`import { quickBot } from "waengine";

quickBot()
    .when("hello").reply("Hi! 👋")
    .when("help").reply("Ich kann dir helfen!")
    .start();`}
              </pre>
            </div>

            <div className="bg-gray-900 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-blue-400 font-mono">Erweitert mit Plugins</span>
                <button
                  onClick={() => copyToClipboard(`import { WhatsAppClient } from "waengine";

const client = new WhatsAppClient();

// Plugins laden
await client.load.Plugins('economy-system');
await client.load.Plugins('games-plugin');

client.on('message', async (msg) => {
    if (msg.text === '!balance') {
        // Economy Plugin Command
    }
});

client.connect();`)}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="text-white font-mono text-sm overflow-x-auto">
{`import { WhatsAppClient } from "waengine";

const client = new WhatsAppClient();

// Plugins laden
await client.load.Plugins('economy-system');
await client.load.Plugins('games-plugin');

client.on('message', async (msg) => {
    if (msg.text === '!balance') {
        // Economy Plugin Command
    }
});

client.connect();`}
              </pre>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">WAEngine</span>
                </div>
                <p className="text-gray-400 mb-4 max-w-md">
                  Die mächtigste WhatsApp Bot Library mit Multi-Device Support, 
                  Plugin-System und 165+ Features.
                </p>
                <div className="flex space-x-4">
                  <a 
                    href="https://github.com/neotreydel-lab/whatsapp-multi-client" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                  <a 
                    href="https://www.npmjs.com/package/waengine" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    NPM
                  </a>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Dokumentation</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/features" className="hover:text-white transition-colors">Alle Features</Link></li>
                  <li><a href="#" className="hover:text-white transition-colors">Quick Start</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Plugin System</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Examples</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Community</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Issues</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Discussions</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contributing</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 WAEngine. MIT License.
              </p>
              {npmStats && (
                <p className="text-gray-400 text-sm mt-4 md:mt-0">
                  Version {npmStats.version} • Letzte Aktualisierung: {formatDate(npmStats.versions?.published)}
                </p>
              )}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}