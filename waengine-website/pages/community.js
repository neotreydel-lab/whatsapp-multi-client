import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Users, 
  Star, 
  GitBranch, 
  Code, 
  Zap, 
  TrendingUp,
  Calendar,
  Award,
  Activity,
  ExternalLink,
  Github,
  Heart,
  Coffee
} from 'lucide-react';

export default function CommunityPage() {
  const [githubStats, setGithubStats] = useState(null);
  const [npmStats, setNpmStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Aktualisiere Stats alle 10 Minuten
    const interval = setInterval(fetchStats, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [githubResponse, npmResponse] = await Promise.all([
        fetch('/api/github-stats'),
        fetch('/api/npm-stats')
      ]);
      
      const githubData = await githubResponse.json();
      const npmData = await npmResponse.json();
      
      setGithubStats(githubData);
      setNpmStats(npmData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
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

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <>
      <Head>
        <title>Community - WAEngine</title>
        <meta name="description" content="WAEngine Community Stats - GitHub Aktivität, Contributors und Projekt-Gesundheit" />
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
                <Link href="/playground" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Playground
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 mb-4">
                <Users className="w-4 h-4 mr-2" />
                Open Source Community
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              WAEngine <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Community</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Entdecke die lebendige Community hinter WAEngine. Von GitHub-Aktivität bis hin zu 
              NPM-Downloads - hier siehst du alle wichtigen Projekt-Statistiken.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center pb-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            {/* GitHub & NPM Overview */}
            <section className="pb-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-green-100">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {formatNumber(githubStats?.community?.stars)}
                    </div>
                    <div className="text-sm text-gray-600 text-center">GitHub Stars</div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                      <GitBranch className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {formatNumber(githubStats?.community?.forks)}
                    </div>
                    <div className="text-sm text-gray-600 text-center">Forks</div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-green-100">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {githubStats?.contributors?.total || 0}
                    </div>
                    <div className="text-sm text-gray-600 text-center">Contributors</div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-purple-100">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1 text-center">
                      {formatNumber(npmStats?.downloads?.monthly)}
                    </div>
                    <div className="text-sm text-gray-600 text-center">NPM Downloads/Monat</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Project Health */}
            {githubStats?.health && (
              <section className="pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Activity className="w-6 h-6 mr-3 text-green-600" />
                      Projekt-Gesundheit
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getHealthColor(githubStats.health.activity_score)}`}>
                          {githubStats.health.activity_score}/100
                        </div>
                        <h3 className="font-semibold text-gray-900 mt-3 mb-2">Aktivität</h3>
                        <p className="text-sm text-gray-600">
                          {githubStats.commits.recent_30_days} Commits in 30 Tagen
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getHealthColor(githubStats.health.community_score)}`}>
                          {githubStats.health.community_score}/100
                        </div>
                        <h3 className="font-semibold text-gray-900 mt-3 mb-2">Community</h3>
                        <p className="text-sm text-gray-600">
                          {githubStats.contributors.total} Contributors, {githubStats.community.forks} Forks
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getHealthColor(githubStats.health.maintenance_score)}`}>
                          {githubStats.health.maintenance_score}/100
                        </div>
                        <h3 className="font-semibold text-gray-900 mt-3 mb-2">Wartung</h3>
                        <p className="text-sm text-gray-600">
                          Letzter Push: {formatDate(githubStats.repository.pushed_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Contributors */}
            {githubStats?.contributors?.top && (
              <section className="pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Award className="w-6 h-6 mr-3 text-yellow-600" />
                      Top Contributors
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                      {githubStats.contributors.top.slice(0, 5).map((contributor, index) => (
                        <div key={contributor.login} className="text-center">
                          <div className="relative mb-4">
                            <img
                              src={contributor.avatar_url}
                              alt={contributor.login}
                              className="w-16 h-16 rounded-full mx-auto border-4 border-white shadow-lg"
                            />
                            {index === 0 && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">👑</span>
                              </div>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{contributor.login}</h3>
                          <p className="text-sm text-gray-600 mb-2">{contributor.contributions} Commits</p>
                          <a
                            href={contributor.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Github className="w-3 h-3 mr-1" />
                            Profil
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Development Activity */}
            <section className="pb-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Commit Activity */}
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Code className="w-5 h-5 mr-3 text-green-600" />
                      Commit-Aktivität
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Letzte 30 Tage</span>
                        <span className="font-semibold text-gray-900">
                          {githubStats?.commits?.recent_30_days || 0} Commits
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Durchschnitt/Tag</span>
                        <span className="font-semibold text-gray-900">
                          {githubStats?.commits?.avg_per_day || 0} Commits
                        </span>
                      </div>
                      
                      {githubStats?.commits?.last_commit && (
                        <div className="border-t pt-4">
                          <p className="text-sm text-gray-600 mb-2">Letzter Commit:</p>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="font-mono text-sm text-gray-900 mb-1">
                              {githubStats.commits.last_commit.message}
                            </p>
                            <p className="text-xs text-gray-500">
                              {githubStats.commits.last_commit.author} • {githubStats.commits.last_commit.sha}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Issues & Releases */}
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                      Issues & Releases
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Offene Issues</span>
                        <span className="font-semibold text-gray-900">
                          {githubStats?.issues?.open || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Geschlossene Issues</span>
                        <span className="font-semibold text-gray-900">
                          {githubStats?.issues?.closed || 0}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Releases</span>
                        <span className="font-semibold text-gray-900">
                          {githubStats?.releases?.total || 0}
                        </span>
                      </div>
                      
                      {githubStats?.releases?.latest && (
                        <div className="border-t pt-4">
                          <p className="text-sm text-gray-600 mb-2">Neueste Version:</p>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="font-semibold text-gray-900 mb-1">
                              {githubStats.releases.latest.tag_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDate(githubStats.releases.latest.published_at)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Language Stats */}
            {githubStats?.languages && (
              <section className="pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Programmiersprachen
                    </h2>
                    
                    <div className="space-y-4">
                      {githubStats.languages.slice(0, 5).map((lang, index) => (
                        <div key={lang.name} className="flex items-center">
                          <div className="flex-1 flex items-center">
                            <span className="font-medium text-gray-900 w-24">{lang.name}</span>
                            <div className="flex-1 mx-4">
                              <div className="bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                                  style={{ width: `${lang.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {lang.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Call to Action */}
            <section className="pb-20 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-center text-white">
                  <h2 className="text-3xl font-bold mb-4">Werde Teil der Community!</h2>
                  <p className="text-xl mb-8 opacity-90">
                    Hilf mit, WAEngine noch besser zu machen. Jeder Beitrag zählt!
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href={githubStats?.repository?.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      <Github className="w-5 h-5 mr-2" />
                      GitHub Repository
                    </a>
                    
                    <a
                      href="https://github.com/neotreydel-lab/whatsapp-multi-client/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Issue melden
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}