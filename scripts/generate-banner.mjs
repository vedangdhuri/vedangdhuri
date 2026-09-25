import fs from 'node:fs';
import path from 'node:path';

const USERNAME = 'vedangdhuri';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const LANGUAGE_COLORS = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Go: '#00ADD8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  Shell: '#89e051',
  Vue: '#41b883',
  React: '#61dafb'
};

async function fetchStats() {
  const headers = {
    'User-Agent': 'github-readme-banner-bot'
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  try {
    // If token exists, try GraphQL for rich, fast single-query data
    if (GITHUB_TOKEN) {
      const query = `
        query($login: String!) {
          user(login: $login) {
            name
            bio
            followers { totalCount }
            following { totalCount }
            repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: STARGAZERS, direction: DESC}) {
              totalCount
              nodes {
                name
                stargazerCount
                forkCount
                primaryLanguage {
                  name
                  color
                }
              }
            }
          }
        }
      `;

      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { login: USERNAME } })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data?.user) {
          const user = result.data.user;
          const repos = user.repositories.nodes || [];
          const totalStars = repos.reduce((sum, r) => sum + (r.stargazerCount || 0), 0);
          const totalForks = repos.reduce((sum, r) => sum + (r.forkCount || 0), 0);
          
          const langMap = {};
          for (const r of repos) {
            if (r.primaryLanguage?.name) {
              const lang = r.primaryLanguage.name;
              langMap[lang] = (langMap[lang] || 0) + 1;
            }
          }

          const topLanguages = Object.entries(langMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name]) => ({
              name,
              color: LANGUAGE_COLORS[name] || '#58a6ff'
            }));

          return {
            name: user.name || USERNAME,
            followers: user.followers.totalCount,
            totalRepos: user.repositories.totalCount,
            totalStars,
            totalForks,
            topLanguages
          };
        }
      }
    }

    // Fallback: REST API (works unauthenticated locally)
    const userRes = await fetch(`https://api.github.com/users/${USERNAME}`, { headers });
    const user = await userRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner`, { headers });
    const reposRaw = await reposRes.json();
    const repos = Array.isArray(reposRaw) ? reposRaw : [];

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    const langMap = {};
    for (const r of repos) {
      if (r.language) {
        langMap[r.language] = (langMap[r.language] || 0) + 1;
      }
    }

    const topLanguages = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => ({
        name,
        color: LANGUAGE_COLORS[name] || '#58a6ff'
      }));

    return {
      name: user.name || USERNAME,
      followers: user.followers || 0,
      totalRepos: user.public_repos || repos.length || 0,
      totalStars,
      totalForks,
      topLanguages
    };
  } catch (error) {
    console.error('Error fetching GitHub stats, using fallback values:', error);
    return {
      name: 'Vedang Dhuri',
      followers: 25,
      totalRepos: 18,
      totalStars: 42,
      totalForks: 12,
      topLanguages: [
        { name: 'TypeScript', color: '#3178c6' },
        { name: 'Python', color: '#3572A5' },
        { name: 'JavaScript', color: '#f1e05a' },
        { name: 'Django', color: '#44B78B' }
      ]
    };
  }
}

function renderSvg(stats) {
  const updatedDate = new Date().toISOString().split('T')[0];

  const languagesSvg = stats.topLanguages.map((lang, index) => {
    const x = 710 + index * 135;
    return `
      <g transform="translate(${x}, 205)">
        <rect width="125" height="34" rx="8" fill="#161b22" stroke="#30363d" stroke-width="1.2" />
        <circle cx="18" cy="17" r="5" fill="${lang.color}" />
        <text x="32" y="22" fill="#c9d1d9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500">${lang.name}</text>
      </g>
    `;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="340" viewBox="0 0 1280 340" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1280" y2="340" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#080c14" />
      <stop offset="50%" stop-color="#0d1117" />
      <stop offset="100%" stop-color="#161b22" />
    </linearGradient>

    <linearGradient id="brandGrad" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#39FF88" />
      <stop offset="50%" stop-color="#58A6FF" />
      <stop offset="100%" stop-color="#BC8CFF" />
    </linearGradient>

    <linearGradient id="scanline" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#39FF88" stop-opacity="0" />
      <stop offset="50%" stop-color="#39FF88" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#39FF88" stop-opacity="0" />
    </linearGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <style>
      @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
      @keyframes pulseGlow {
        0%, 100% { filter: drop-shadow(0 0 6px #39FF8844); }
        50% { filter: drop-shadow(0 0 14px #39FF8899); }
      }
      .cursor {
        animation: blink 1.1s infinite;
      }
      .pulse-box {
        animation: pulseGlow 4s ease-in-out infinite;
      }
    </style>
  </defs>

  <!-- Background Base -->
  <rect width="1280" height="340" rx="20" fill="url(#bgGrad)" stroke="#30363d" stroke-width="2" />

  <!-- Scanline effect overlay -->
  <rect width="1280" height="340" rx="20" fill="url(#scanline)" />

  <!-- Top Terminal Window Bar -->
  <g transform="translate(30, 24)">
    <circle cx="12" cy="12" r="6" fill="#ff5f56" />
    <circle cx="32" cy="12" r="6" fill="#ffbd2e" />
    <circle cx="52" cy="12" r="6" fill="#27c93f" />
    <text x="80" y="17" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', monospace" font-size="13">
      vedangdhuri@workspace ~ github-readme-status
    </text>
    <rect x="365" y="5" width="8" height="15" fill="#39FF88" class="cursor" />
  </g>

  <!-- Status Chip (Available for hire / building) -->
  <g transform="translate(1080, 32)">
    <rect width="150" height="28" rx="14" fill="#238636" fill-opacity="0.2" stroke="#2ea043" stroke-width="1.2" />
    <circle cx="16" cy="14" r="4" fill="#39FF88" />
    <text x="28" y="19" fill="#39FF88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="600">
      Available for Hire
    </text>
  </g>

  <line x1="30" y1="65" x2="1250" y2="65" stroke="#30363d" stroke-width="1" />

  <!-- Main Headline -->
  <text x="50" y="125" fill="url(#brandGrad)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="36" font-weight="800" letter-spacing="-0.5px">
    VEDANG DHURI
  </text>
  <text x="50" y="160" fill="#c9d1d9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="16" font-weight="400">
    Full-Stack Developer · Real-Time Systems Builder · Cloud &amp; AI/ML Learner
  </text>

  <!-- Dynamic Metrics Cards -->
  <g transform="translate(50, 195)">
    <!-- Repositories -->
    <rect width="145" height="74" rx="12" fill="#161b22" stroke="#30363d" stroke-width="1.5" />
    <text x="18" y="28" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12">Repositories</text>
    <text x="18" y="58" fill="#58a6ff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="24" font-weight="700">${stats.totalRepos}</text>

    <!-- Total Stars -->
    <g transform="translate(160, 0)">
      <rect width="145" height="74" rx="12" fill="#161b22" stroke="#30363d" stroke-width="1.5" />
      <text x="18" y="28" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12">Total Stars</text>
      <text x="18" y="58" fill="#e3b341" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="24" font-weight="700">${stats.totalStars}</text>
    </g>

    <!-- Followers -->
    <g transform="translate(320, 0)">
      <rect width="145" height="74" rx="12" fill="#161b22" stroke="#30363d" stroke-width="1.5" />
      <text x="18" y="28" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12">Followers</text>
      <text x="18" y="58" fill="#bc8cff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="24" font-weight="700">${stats.followers}</text>
    </g>

    <!-- Forks -->
    <g transform="translate(480, 0)">
      <rect width="145" height="74" rx="12" fill="#161b22" stroke="#30363d" stroke-width="1.5" />
      <text x="18" y="28" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12">Forks</text>
      <text x="18" y="58" fill="#39FF88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="24" font-weight="700">${stats.totalForks}</text>
    </g>
  </g>

  <!-- Top Languages Section -->
  <g transform="translate(710, 195)">
    <text x="0" y="-8" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12" font-weight="600">
      PRIMARY LANGUAGES
    </text>
  </g>
  ${languagesSvg}

  <!-- Footer & Timestamp -->
  <text x="50" y="308" fill="#58a6ff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12">
    https://vedangdhuri.xyz
  </text>
  <text x="1230" y="308" text-anchor="end" fill="#8b949e" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="12">
    Auto-updated: ${updatedDate} UTC
  </text>
</svg>`;
}

async function main() {
  console.log('Fetching latest GitHub stats for', USERNAME, '...');
  const stats = await fetchStats();
  console.log('Stats loaded:', stats);

  const svgContent = renderSvg(stats);

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const outPath = path.join(distDir, 'vedangdhuri-readme-banner.svg');
  fs.writeFileSync(outPath, svgContent, 'utf8');
  console.log('Banner successfully generated at:', outPath);

  // Also write to assets directory so local repository previews and fallbacks are updated
  const assetsDir = path.resolve('assets');
  if (fs.existsSync(assetsDir)) {
    fs.writeFileSync(path.join(assetsDir, 'vedangdhuri-animated-github-banner.svg'), svgContent, 'utf8');
    console.log('Updated assets/vedangdhuri-animated-github-banner.svg');
  }
}

main().catch(err => {
  console.error('Fatal banner generation error:', err);
  process.exit(1);
});
