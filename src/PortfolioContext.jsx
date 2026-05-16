import { createContext, useContext, useEffect, useState } from 'react'
import { fetchPortfolio, resolveAsset } from './api'

// Static defaults used when the API isn't available. Mirrors what used to live
// directly inside App/SkillsSection/ExperienceSection.
const DEFAULT_PROJECTS = [
  {
    id: 'krotminer',
    titleKey: 'krotminerTitle',
    descKey: 'krotminerDesc',
    cover: null,
    images: [],
    tech: ['React', 'TypeScript', 'Node.js', 'WebSocket', 'Telegram Mini App', 'Canvas API', 'PostgreSQL', 'REST API', 'CSS Animations', 'Docker'],
  },
  {
    id: 'dao',
    titleKey: 'daoTitle',
    descKey: 'daoDesc',
    cover: null,
    images: [],
    tech: ['React Native', 'TypeScript', 'Node.js', 'ZKP (zk-SNARKs)', 'Swagger', 'PostgreSQL', 'REST API', 'WebSocket', 'Solidity'],
  },
  {
    id: 'bastaxi',
    titleKey: 'bastaxiTitle',
    descKey: 'bastaxiDesc',
    cover: null,
    images: [],
    tech: ['Angular', 'React', 'TypeScript', 'GraphQL', 'Apollo Client', 'Node.js', 'PostgreSQL', 'SCSS'],
  },
  {
    id: 'union',
    titleKey: 'unionTitle',
    descKey: 'unionDesc',
    cover: null,
    images: [],
    tech: ['React', 'TypeScript', 'Node.js', 'Telegram Bot API', 'Telegram Mini App', 'PostgreSQL', 'REST API'],
  },
  {
    id: 'blockmind',
    titleKey: 'blockmindTitle',
    descKey: 'blockmindDesc',
    cover: import.meta.env.BASE_URL + 'blockmind/01-dashboard.png',
    images: [
      import.meta.env.BASE_URL + 'blockmind/01-dashboard.png',
      import.meta.env.BASE_URL + 'blockmind/02-trading.png',
      import.meta.env.BASE_URL + 'blockmind/03-screen.png',
      import.meta.env.BASE_URL + 'blockmind/04-screen.png',
      import.meta.env.BASE_URL + 'blockmind/05-screen.png',
      import.meta.env.BASE_URL + 'blockmind/06-screen.png',
    ],
    tech: ['React', 'Node.js', 'TypeScript', 'WebSocket', 'PostgreSQL', 'Docker', 'GitLab CI/CD', 'REST API', 'HTML', 'CSS/SCSS', 'AI Integration', 'Middleware'],
  },
  {
    id: 'flora',
    titleKey: 'floraTitle',
    descKey: 'floraDesc',
    cover: null,
    images: [],
    tech: ['Laravel', 'PHP', 'MySQL', 'Eloquent ORM', 'Blade', 'HTML', 'CSS', 'Bootstrap', 'JavaScript', 'REST API'],
  },
  {
    id: 'carauto',
    titleKey: 'carautoTitle',
    descKey: 'carautoDesc',
    cover: null,
    images: [],
    tech: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS/SCSS', 'REST API', 'Responsive Design'],
  },
]

const DEFAULT_SKILLS = [
  { id: 's_react', name: 'React', level: 95, category: 'frontend', years: 5 },
  { id: 's_ts', name: 'TypeScript', level: 90, category: 'frontend', years: 4 },
  { id: 's_next', name: 'Next.js', level: 85, category: 'frontend', years: 3 },
  { id: 's_node', name: 'Node.js', level: 90, category: 'backend', years: 5 },
  { id: 's_pg', name: 'PostgreSQL', level: 85, category: 'data', years: 4 },
  { id: 's_mysql', name: 'MySQL', level: 80, category: 'data', years: 3 },
  { id: 's_git', name: 'Git', level: 90, category: 'data', years: 6 },
  { id: 's_github', name: 'GitHub', level: 90, category: 'data', years: 6 },
  { id: 's_gitlab', name: 'GitLab', level: 85, category: 'data', years: 4 },
  { id: 's_php', name: 'PHP', level: 80, category: 'backend', years: 4 },
  { id: 's_laravel', name: 'Laravel', level: 75, category: 'backend', years: 3 },
  { id: 's_python', name: 'Python', level: 70, category: 'backend', years: 2 },
  { id: 's_rest', name: 'REST API', level: 95, category: 'backend', years: 5 },
  { id: 's_ws', name: 'WebSocket', level: 80, category: 'backend', years: 3 },
  { id: 's_html', name: 'HTML', level: 95, category: 'frontend', years: 7 },
  { id: 's_css', name: 'CSS / SCSS', level: 90, category: 'frontend', years: 7 },
  { id: 's_tailwind', name: 'Tailwind', level: 85, category: 'frontend', years: 3 },
  { id: 's_bootstrap', name: 'Bootstrap', level: 80, category: 'frontend', years: 5 },
  { id: 's_wp', name: 'WordPress', level: 75, category: 'backend', years: 3 },
  { id: 's_rn', name: 'React Native', level: 80, category: 'frontend', years: 2 },
  { id: 's_angular', name: 'Angular', level: 75, category: 'frontend', years: 2 },
  { id: 's_vue', name: 'Vue', level: 70, category: 'frontend', years: 2 },
  { id: 's_swagger', name: 'Swagger', level: 85, category: 'backend', years: 4 },
  { id: 's_zkp', name: 'ZKP', level: 75, category: 'backend', years: 1 },
]

const DEFAULT_EXPERIENCE = [
  { id: 'e_union1', company: 'Union', roleKey: 'expUnion1Role', durationYears: 1 },
  { id: 'e_union2', company: 'Union', roleKey: 'expUnion2Role', durationYears: 2 },
  { id: 'e_bastaxi', company: 'Bastaxi', roleKey: 'expBastaxiRole', durationYears: 1 },
  { id: 'e_blockmind', company: 'BlockMind', roleKey: 'expBlockmindRole', durationYears: 1 },
  { id: 'e_krotminer', company: 'KrotMiner', roleKey: 'expKrotminerRole', durationYears: 1 },
]

const DEFAULT_PROFILE = {
  fullNameKey: 'fullName',
  roleKey: 'role',
  email: 'bogdankabanovprof@gmail.com',
  phone: '+7 (962) 888-14-37',
  github: 'https://github.com/bogdan-kabanov',
  telegram: 'https://t.me/bogdan_kabanov',
  githubUsername: 'bogdan-kabanov',
}

const DEFAULTS = {
  projects: DEFAULT_PROJECTS,
  skills: DEFAULT_SKILLS,
  experience: DEFAULT_EXPERIENCE,
  profile: DEFAULT_PROFILE,
  posts: [],
  source: 'static',
}

function normalize(api) {
  if (!api) return DEFAULTS
  const projects = (api.projects || []).map((p) => ({
    id: p.id,
    title: p.title || {},
    description: p.description || {},
    cover: resolveAsset(p.cover),
    images: (p.images || []).map(resolveAsset),
    tech: p.tech || [],
  }))
  const posts = (api.posts || []).map((p) => ({
    ...p,
    cover: resolveAsset(p.cover),
  }))
  return {
    projects: projects.length ? projects : DEFAULT_PROJECTS,
    skills: api.skills?.length ? api.skills : DEFAULT_SKILLS,
    experience: api.experience?.length ? api.experience : DEFAULT_EXPERIENCE,
    profile: { ...DEFAULT_PROFILE, ...(api.profile || {}) },
    posts,
    source: 'api',
  }
}

const PortfolioContext = createContext(DEFAULTS)

export function PortfolioProvider({ children }) {
  const [data, setData] = useState(DEFAULTS)

  useEffect(() => {
    const ctrl = new AbortController()
    fetchPortfolio({ signal: ctrl.signal })
      .then((api) => {
        if (api) setData(normalize(api))
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.warn('[portfolio] failed to load API data, using static fallback:', err.message)
        }
      })
    return () => ctrl.abort()
  }, [])

  return (
    <PortfolioContext.Provider value={data}>{children}</PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  return useContext(PortfolioContext)
}

// Helper for components: resolve a localized title/description either from
// a `title: { ru, en }` shape (API) or fall back to an i18n key.
export function resolveLocalized(item, lang, key, t) {
  if (item && item[key] && typeof item[key] === 'object') {
    return item[key][lang] || item[key].ru || item[key].en || ''
  }
  // Backwards-compat with static items that carried *Key strings
  const fallbackKey = item?.[`${key}Key`] || item?.titleKey || item?.descKey
  if (fallbackKey && t) return t(lang, fallbackKey)
  return ''
}
