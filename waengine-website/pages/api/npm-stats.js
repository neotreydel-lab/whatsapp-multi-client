// NPM API für WAEngine Statistiken
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // NPM Registry API aufrufen
    const npmResponse = await axios.get('https://registry.npmjs.org/waengine');
    const packageData = npmResponse.data;

    // Download-Statistiken von NPM API
    const downloadsResponse = await axios.get('https://api.npmjs.org/downloads/point/last-month/waengine');
    const weeklyDownloads = await axios.get('https://api.npmjs.org/downloads/point/last-week/waengine');
    const dailyDownloads = await axios.get('https://api.npmjs.org/downloads/point/last-day/waengine');

    // Daten zusammenstellen
    const stats = {
      name: packageData.name,
      version: packageData['dist-tags'].latest,
      description: packageData.description,
      author: packageData.author,
      license: packageData.license,
      homepage: packageData.homepage,
      repository: packageData.repository,
      keywords: packageData.keywords,
      
      // Download-Statistiken
      downloads: {
        monthly: downloadsResponse.data.downloads || 0,
        weekly: weeklyDownloads.data.downloads || 0,
        daily: dailyDownloads.data.downloads || 0
      },
      
      // Versions-Info
      versions: {
        latest: packageData['dist-tags'].latest,
        total: Object.keys(packageData.versions).length,
        published: packageData.time[packageData['dist-tags'].latest]
      },
      
      // Dependencies
      dependencies: packageData.versions[packageData['dist-tags'].latest].dependencies || {},
      
      // Maintainers
      maintainers: packageData.maintainers || [],
      
      // Zusätzliche Infos
      created: packageData.time.created,
      modified: packageData.time.modified,
      
      // Berechnete Statistiken
      calculated: {
        avgDownloadsPerDay: Math.round((downloadsResponse.data.downloads || 0) / 30),
        isPopular: (downloadsResponse.data.downloads || 0) > 1000,
        isRecent: new Date(packageData.time[packageData['dist-tags'].latest]) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    };

    // Cache-Header setzen
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return res.status(200).json(stats);
    
  } catch (error) {
    console.error('NPM API Error:', error.message);
    
    // Fallback-Daten wenn API nicht erreichbar
    const fallbackStats = {
      name: 'waengine',
      version: '1.0.9',
      description: '🚀 WAEngine - The most powerful WhatsApp Bot Library with Multi-Device Support & EasyBot API',
      downloads: {
        monthly: 0,
        weekly: 0,
        daily: 0
      },
      error: 'Unable to fetch live stats',
      fallback: true
    };
    
    return res.status(200).json(fallbackStats);
  }
}