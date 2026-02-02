// GitHub API für Community-Statistiken
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const repoOwner = 'neotreydel-lab';
    const repoName = 'whatsapp-multi-client';
    const baseUrl = 'https://api.github.com';

    // Parallel API Calls für bessere Performance
    const [
      repoResponse,
      contributorsResponse,
      issuesResponse,
      releasesResponse,
      commitsResponse
    ] = await Promise.all([
      axios.get(`${baseUrl}/repos/${repoOwner}/${repoName}`),
      axios.get(`${baseUrl}/repos/${repoOwner}/${repoName}/contributors`),
      axios.get(`${baseUrl}/repos/${repoOwner}/${repoName}/issues?state=all&per_page=100`),
      axios.get(`${baseUrl}/repos/${repoOwner}/${repoName}/releases`),
      axios.get(`${baseUrl}/repos/${repoOwner}/${repoName}/commits?per_page=100`)
    ]);

    const repo = repoResponse.data;
    const contributors = contributorsResponse.data;
    const issues = issuesResponse.data;
    const releases = releasesResponse.data;
    const commits = commitsResponse.data;

    // Statistiken berechnen
    const openIssues = issues.filter(issue => issue.state === 'open' && !issue.pull_request);
    const closedIssues = issues.filter(issue => issue.state === 'closed' && !issue.pull_request);
    const pullRequests = issues.filter(issue => issue.pull_request);

    // Commit-Aktivität der letzten 30 Tage
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCommits = commits.filter(commit => 
      new Date(commit.commit.author.date) > thirtyDaysAgo
    );

    // Top Contributors (Top 10)
    const topContributors = contributors
      .slice(0, 10)
      .map(contributor => ({
        login: contributor.login,
        avatar_url: contributor.avatar_url,
        contributions: contributor.contributions,
        html_url: contributor.html_url
      }));

    // Release-Statistiken
    const latestRelease = releases[0];
    const releaseFrequency = releases.length > 1 ? 
      Math.round((new Date(releases[0].created_at) - new Date(releases[releases.length - 1].created_at)) / (1000 * 60 * 60 * 24) / releases.length) : 0;

    // Language-Statistiken
    const languagesResponse = await axios.get(`${baseUrl}/repos/${repoOwner}/${repoName}/languages`);
    const languages = languagesResponse.data;
    const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    const languageStats = Object.entries(languages).map(([lang, bytes]) => ({
      name: lang,
      percentage: Math.round((bytes / totalBytes) * 100),
      bytes
    })).sort((a, b) => b.percentage - a.percentage);

    const stats = {
      // Repository Basics
      repository: {
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        size: repo.size,
        default_branch: repo.default_branch
      },

      // Community Stats
      community: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        subscribers: repo.subscribers_count,
        network_count: repo.network_count,
        open_issues: repo.open_issues_count
      },

      // Issues & PRs
      issues: {
        total: issues.length,
        open: openIssues.length,
        closed: closedIssues.length,
        pull_requests: pullRequests.length
      },

      // Contributors
      contributors: {
        total: contributors.length,
        top: topContributors
      },

      // Commit Activity
      commits: {
        total: commits.length,
        recent_30_days: recentCommits.length,
        avg_per_day: Math.round(recentCommits.length / 30),
        last_commit: commits[0] ? {
          sha: commits[0].sha.substring(0, 7),
          message: commits[0].commit.message.split('\n')[0],
          author: commits[0].commit.author.name,
          date: commits[0].commit.author.date
        } : null
      },

      // Releases
      releases: {
        total: releases.length,
        latest: latestRelease ? {
          tag_name: latestRelease.tag_name,
          name: latestRelease.name,
          published_at: latestRelease.published_at,
          html_url: latestRelease.html_url
        } : null,
        frequency_days: releaseFrequency
      },

      // Languages
      languages: languageStats,

      // Berechnete Metriken
      health: {
        activity_score: Math.min(100, Math.round((recentCommits.length / 30) * 10 + (repo.stargazers_count / 100) * 5)),
        community_score: Math.min(100, Math.round((contributors.length * 2) + (repo.forks_count / 10))),
        maintenance_score: Math.min(100, Math.round(100 - (new Date() - new Date(repo.pushed_at)) / (1000 * 60 * 60 * 24)))
      }
    };

    // Cache-Header setzen
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    
    return res.status(200).json(stats);
    
  } catch (error) {
    console.error('GitHub API Error:', error.message);
    
    // Fallback-Daten
    const fallbackStats = {
      repository: {
        name: 'waengine',
        full_name: 'neotreydel-lab/whatsapp-multi-client',
        description: '🚀 WAEngine - The most powerful WhatsApp Bot Library',
        html_url: 'https://github.com/neotreydel-lab/whatsapp-multi-client'
      },
      community: {
        stars: 0,
        forks: 0,
        watchers: 0
      },
      error: 'Unable to fetch GitHub stats',
      fallback: true
    };
    
    return res.status(200).json(fallbackStats);
  }
}