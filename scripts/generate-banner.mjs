import fs from 'node:fs';
import path from 'node:path';

const USERNAME = 'vedangdhuri';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00'
};

function formatMonthYear(isoDate) {
  if (!isoDate) return 'Jan 2022';
  const d = new Date(isoDate);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

async function fetchStats() {
  const headers = {
    'User-Agent': 'octocanvas-banner-bot'
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  // 1. Fetch contributions
  let totalContributions = 3193;
  try {
    const contribRes = await fetch(`https://github.com/${USERNAME}.contribs`);
    if (contribRes.ok) {
      const contribData = await contribRes.json();
      if (contribData.total_contributions) {
        totalContributions = contribData.total_contributions;
      }
    }
  } catch (err) {
    console.warn('Could not fetch contribs endpoint, using fallback/last known:', totalContributions);
  }

  // 2. Fetch User Profile & Repos
  try {
    const userRes = await fetch(`https://api.github.com/users/${USERNAME}`, { headers });
    const user = await userRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner`, { headers });
    const reposRaw = await reposRes.json();
    const repos = Array.isArray(reposRaw) ? reposRaw : [];

    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalRepos = user.public_repos ?? repos.length;
    const followers = user.followers ?? 10;
    const location = user.location || 'Vadodara, Gujarat, India';
    const company = user.company || 'Parul University';
    const blog = (user.blog || 'vedangdhuri.xyz').replace(/^https?:\/\//, '').replace(/\/$/, '');
    const joined = formatMonthYear(user.created_at);

    // Aggregate languages
    const langMap = {};
    for (const r of repos) {
      if (r.language) {
        langMap[r.language] = (langMap[r.language] || 0) + 1;
      }
    }

    const topLanguages = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        color: LANGUAGE_COLORS[name] || '#7d8590'
      }));

    return {
      username: user.login || USERNAME,
      followers,
      totalRepos,
      contributions: totalContributions,
      totalStars,
      location,
      company,
      blog,
      joined,
      topLanguages
    };
  } catch (error) {
    console.error('Error fetching GitHub API, using fallback profile data:', error);
    return {
      username: USERNAME,
      followers: 10,
      totalRepos: 22,
      contributions: totalContributions,
      totalStars: 52,
      location: 'Vadodara, Gujarat, India',
      company: 'Parul University',
      blog: 'vedangdhuri.xyz',
      joined: 'Jan 2022',
      topLanguages: [
        { name: 'JavaScript', count: 11, color: '#f1e05a' },
        { name: 'Python', count: 3, color: '#3572A5' },
        { name: 'TypeScript', count: 2, color: '#3178c6' },
        { name: 'C', count: 1, color: '#555555' },
        { name: 'HTML', count: 1, color: '#e34c26' }
      ]
    };
  }
}

function getAvatarBase64() {
  const possiblePaths = [
    path.resolve('ascii-art-github.png'),
    path.resolve('assets', 'ascii-art-github.png'),
    path.resolve('..', 'vedangdhuri', 'ascii-art-github.png')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const buffer = fs.readFileSync(p);
      return `data:image/png;base64,${buffer.toString('base64')}`;
    }
  }

  return '';
}

function renderOctoCanvasBanner(data) {
  const avatarBase64 = getAvatarBase64();

  // Calculate languages row layout
  let currentX = 356;
  const langElements = data.topLanguages.map((lang) => {
    const dotX = currentX + 6;
    const textX = currentX + 18;
    const approxTextWidth = (lang.name.length + String(lang.count).length + 4) * 8.5;
    currentX += approxTextWidth + 28;

    return `
      <g>
        <circle cx="${dotX}" cy="272" r="5" fill="${lang.color}" />
        <text x="${textX}" y="276" font-family="'Courier New', Courier, monospace" font-size="14">
          <tspan fill="#ffffff" font-weight="600">${lang.name} </tspan>
          <tspan fill="#7d8590">(${lang.count})</tspan>
        </text>
      </g>
    `;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="320" viewBox="0 0 1280 320" fill="none">
  <defs>
    <!-- Background Gradient matching OctoCanvas -->
    <linearGradient id="bannerBg" x1="0" y1="0" x2="1280" y2="320" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0d1117" />
      <stop offset="50%" stop-color="#161b22" />
      <stop offset="100%" stop-color="#1c2128" />
    </linearGradient>

    <!-- Top Right Green Aura Glow -->
    <radialGradient id="auraTopRight" cx="100%" cy="0%" r="70%">
      <stop offset="0%" stop-color="#5eed83" stop-opacity="0.18" />
      <stop offset="60%" stop-color="#5eed83" stop-opacity="0.04" />
      <stop offset="100%" stop-color="#5eed83" stop-opacity="0" />
    </radialGradient>

    <!-- Bottom Left Green Aura Glow -->
    <radialGradient id="auraBottomLeft" cx="0%" cy="100%" r="80%">
      <stop offset="0%" stop-color="#5eed83" stop-opacity="0.14" />
      <stop offset="60%" stop-color="#5eed83" stop-opacity="0.03" />
      <stop offset="100%" stop-color="#5eed83" stop-opacity="0" />
    </radialGradient>

    <!-- Neon Glow Filter for Avatar Border -->
    <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Rounded avatar clip path -->
    <clipPath id="avatarClip">
      <rect x="52" y="36" width="248" height="248" rx="16" />
    </clipPath>
  </defs>

  <!-- Background Base -->
  <rect width="1280" height="320" fill="url(#bannerBg)" />

  <!-- Decorative Green Glow Orbs -->
  <rect width="1280" height="320" fill="url(#auraTopRight)" />
  <rect width="1280" height="320" fill="url(#auraBottomLeft)" />

  <!-- Avatar Column (Left) -->
  <g id="avatar-container">
    <!-- Glow aura behind border -->
    <rect x="52" y="36" width="248" height="248" rx="16" fill="none" stroke="#5fed83" stroke-width="6" opacity="0.6" filter="url(#neonGlow)" />
    
    <!-- Photo Image from ascii-art-github.png -->
    ${avatarBase64 ? `<image href="${avatarBase64}" x="52" y="36" width="248" height="248" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)" />` : ''}

    <!-- Sharp Border on Top -->
    <rect x="52" y="36" width="248" height="248" rx="16" fill="none" stroke="#5fed83" stroke-width="4" />
  </g>

  <!-- Right Content Column -->
  <g id="content-container">
    <!-- Title / Username -->
    <text x="356" y="86" fill="#5fed83" font-family="'Courier New', Courier, monospace" font-size="48" font-weight="800" letter-spacing="-0.5px">
      ${data.username}
    </text>

    <!-- Stats Row -->
    <text x="356" y="136" font-family="'Courier New', Courier, monospace" font-size="16">
      <tspan fill="#ffffff" font-weight="700">${data.followers.toLocaleString()}</tspan>
      <tspan fill="#7d8590"> followers   </tspan>
      <tspan fill="#ffffff" font-weight="700">${data.totalRepos.toLocaleString()}</tspan>
      <tspan fill="#7d8590"> repos   </tspan>
      <tspan fill="#ffffff" font-weight="700">${data.contributions.toLocaleString()}</tspan>
      <tspan fill="#7d8590"> contributions   </tspan>
      <tspan fill="#ffd85a">⭐ </tspan>
      <tspan fill="#ffffff" font-weight="700">${data.totalStars.toLocaleString()}</tspan>
      <tspan fill="#7d8590"> stars</tspan>
    </text>

    <!-- Info Row -->
    <text x="356" y="188" font-family="'Courier New', Courier, monospace" font-size="14" fill="#7d8590">
      <tspan>📍 ${data.location}   </tspan>
      <tspan>🏢 ${data.company}   </tspan>
      <tspan>🌐 ${data.blog}   </tspan>
      <tspan>📅 Joined ${data.joined}</tspan>
    </text>

    <!-- Top Languages Header -->
    <text x="356" y="246" fill="#7d8590" font-family="'Courier New', Courier, monospace" font-size="12" font-weight="600" letter-spacing="1px">
      TOP LANGUAGES
    </text>

    <!-- Top Languages List -->
    ${langElements}
  </g>

  <!-- Bottom decorative bar (OctoCanvas preview frame detail) -->
  <rect x="0" y="318" width="1280" height="2" fill="#21262d" />
  <rect x="52" y="318" width="1176" height="2" fill="#30363d" />
</svg>`;
}

async function main() {
  console.log('Fetching live profile data for OctoCanvas banner...');
  const data = await fetchStats();
  console.log('Loaded data:', data);

  const svg = renderOctoCanvasBanner(data);

  const distDir = path.resolve('dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const outPath = path.join(distDir, 'vedangdhuri-readme-banner.svg');
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log('Saved SVG to:', outPath);

  // Also write to assets directory so local repository previews and fallbacks are updated
  const assetsDir = path.resolve('assets');
  if (fs.existsSync(assetsDir)) {
    fs.writeFileSync(path.join(assetsDir, 'vedangdhuri-animated-github-banner.svg'), svg, 'utf8');
    fs.writeFileSync(path.join(assetsDir, 'vedangdhuri-readme-banner.svg'), svg, 'utf8');
    console.log('Updated assets/vedangdhuri-animated-github-banner.svg and assets/vedangdhuri-readme-banner.svg');
  }
}

main().catch(err => {
  console.error('Error generating banner:', err);
  process.exit(1);
});
