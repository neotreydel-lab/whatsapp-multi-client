import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Package, 
  Search, 
  Filter, 
  Code, 
  Copy, 
  Check, 
  ExternalLink,
  ArrowLeft,
  Star,
  Download,
  Zap
} from 'lucide-react';

export default function PluginsPage() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const response = await fetch('/api/plugins');
      const data = await response.json();
      setPlugins(data.plugins);
    } catch (error) {
      console.error('Error fetching plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plugin.commands.some(cmd => cmd.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(plugins.map(p => p.category))];

  if (selectedPlugin) {
    return (
      <>
        <Head>
          <title>{selectedPlugin.name} - WAEngine Plugin</title>
          <meta name="description" content={selectedPlugin.description} />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedPlugin(null)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Zurück zu Plugins</span>
                </button>
                
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">WAEngine</span>
                </Link>
              </div>
            </div>
          </header>

          {/* Plugin Detail */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Plugin Header */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl flex items-center justify-center text-3xl">
                    {selectedPlugin.icon}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedPlugin.name}</h1>
                    <p className="text-lg text-gray-600 mb-2">{selectedPlugin.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{selectedPlugin.category}</span>
                      <span>Version {selectedPlugin.version}</span>
                      <span>{selectedPlugin.commands.length} Commands</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Installation */}
              <div className="bg-gray-900 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-green-400 font-mono text-sm">Plugin Installation</span>
                  <button
                    onClick={() => copyToClipboard(`await client.load.Plugins('${selectedPlugin.id}');`)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="text-sm">{copied ? 'Kopiert!' : 'Kopieren'}</span>
                  </button>
                </div>
                <code className="text-white font-mono">await client.load.Plugins('{selectedPlugin.id}');</code>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedPlugin.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Commands */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Commands ({selectedPlugin.commands.length})
              </h2>
              
              <div className="grid gap-4">
                {selectedPlugin.commands.map((command, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-green-600">
                            !{command.name}
                          </code>
                          <span className="text-gray-700">{command.description}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Verwendung:</span> 
                          <code className="ml-2 bg-gray-100 px-2 py-1 rounded">{command.usage}</code>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(command.usage)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Example */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Code-Beispiel</h2>
              
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-blue-400 font-mono text-sm">JavaScript</span>
                  <button
                    onClick={() => copyToClipboard(selectedPlugin.codeExample)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="text-white font-mono text-sm overflow-x-auto">
                  {selectedPlugin.codeExample}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Plugin Explorer - WAEngine</title>
        <meta name="description" content="Entdecke alle 8 WAEngine Plugins mit 80+ Commands für deinen WhatsApp Bot" />
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
                <Link href="/playground" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Playground
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                <Package className="w-4 h-4 mr-2" />
                8 Plugins • 80+ Commands
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Plugin <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Explorer</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Entdecke alle verfügbaren WAEngine Plugins. Von Economy-Systemen bis hin zu AI-Integration - 
              erweitere deinen Bot mit mächtigen Features.
            </p>

            {/* Search & Filter */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Plugin oder Command suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'Alle Kategorien' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plugins Grid */}
        <section className="pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPlugins.map((plugin) => (
                  <div
                    key={plugin.id}
                    onClick={() => setSelectedPlugin(plugin)}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
                        {plugin.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{plugin.name}</h3>
                        <span className="text-sm text-gray-500">{plugin.category}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{plugin.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{plugin.commands.length} Commands</span>
                      <span>v{plugin.version}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {plugin.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                      {plugin.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{plugin.features.length - 3} mehr
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-green-600">
                        !{plugin.commands[0]?.name}
                      </code>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredPlugins.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Keine Plugins gefunden</h3>
                <p className="text-gray-600">Versuche einen anderen Suchbegriff oder Filter.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}