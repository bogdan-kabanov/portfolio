import { useEffect, useRef } from 'react'
import { useLang } from './LangContext'
import { t } from './i18n'
import './SkillModal.css'

// Skill metadata: descKey + projectKeys point to i18n entries.
// Project tags can be raw strings (proper nouns / brand names) or { key } for translatable labels.
const SKILL_INFO = {
  'React': {
    descKey: 'skillReactDesc',
    years: 5,
    projects: [{ key: 'projEcommerce' }, { key: 'projPortfolio' }, { key: 'projChat' }],
  },
  'TypeScript': {
    descKey: 'skillTypeScriptDesc',
    years: 4,
    projects: [{ key: 'projMusic' }, { key: 'projTask' }],
  },
  'Next.js': {
    descKey: 'skillNextDesc',
    years: 3,
    projects: [{ key: 'projEcommerce' }],
  },
  'Node.js': {
    descKey: 'skillNodeDesc',
    years: 5,
    projects: [{ key: 'projChat' }, { key: 'projEcommerce' }],
  },
  'PostgreSQL': {
    descKey: 'skillPostgresDesc',
    years: 4,
    projects: [{ key: 'projEcommerce' }],
  },
  'MySQL': {
    descKey: 'skillMysqlDesc',
    years: 3,
    projects: [{ key: 'projWordpress' }],
  },
  'Git': {
    descKey: 'skillGitDesc',
    years: 6,
    projects: [{ key: 'projAll' }],
  },
  'GitHub': {
    descKey: 'skillGithubDesc',
    years: 6,
    projects: [{ key: 'projAllOSS' }],
  },
  'GitLab': {
    descKey: 'skillGitlabDesc',
    years: 4,
    projects: [{ key: 'projCorporate' }],
  },
  'PHP': {
    descKey: 'skillPhpDesc',
    years: 4,
    projects: [{ key: 'projWordpress' }],
  },
  'Laravel': {
    descKey: 'skillLaravelDesc',
    years: 3,
    projects: [{ key: 'projPortal' }],
  },
  'Python': {
    descKey: 'skillPythonDesc',
    years: 2,
    projects: [{ key: 'projAutomation' }],
  },
  'REST API': {
    descKey: 'skillRestDesc',
    years: 5,
    projects: [{ key: 'projAllBackend' }],
  },
  'WebSocket': {
    descKey: 'skillWsDesc',
    years: 3,
    projects: [{ key: 'projChat' }],
  },
  'HTML': {
    descKey: 'skillHtmlDesc',
    years: 7,
    projects: [{ key: 'projAll' }],
  },
  'CSS / SCSS': {
    descKey: 'skillCssDesc',
    years: 7,
    projects: [{ key: 'projAllFrontend' }],
  },
  'Tailwind': {
    descKey: 'skillTailwindDesc',
    years: 3,
    projects: [{ key: 'projTask' }],
  },
  'Bootstrap': {
    descKey: 'skillBootstrapDesc',
    years: 5,
    projects: [{ key: 'projCorporateSites' }],
  },
  'WordPress': {
    descKey: 'skillWordpressDesc',
    years: 3,
    projects: [{ key: 'projCorporateSites' }],
  },
  'React Native': {
    descKey: 'skillRnDesc',
    years: 2,
    projects: [{ key: 'projMobile' }],
  },
  'Angular': {
    descKey: 'skillAngularDesc',
    years: 2,
    projects: [{ key: 'projCorporateApps' }],
  },
  'Vue': {
    descKey: 'skillVueDesc',
    years: 2,
    projects: [{ key: 'projInternal' }],
  },
  'Swagger': {
    descKey: 'skillSwaggerDesc',
    years: 4,
    projects: [{ key: 'projDao' }, { key: 'projAllBackend' }],
  },
  'ZKP': {
    descKey: 'skillZkpDesc',
    years: 1,
    projects: [{ key: 'projDao' }],
  },
}

export default function SkillModal({ skill, onClose }) {
  const ref = useRef(null)
  const { lang } = useLang()

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // position the popup near click point, keeping it on screen
  useEffect(() => {
    if (!ref.current || !skill.clickX) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const margin = 16

    // try to place to the right of the click first
    let left = skill.clickX + 30
    if (left + rect.width > window.innerWidth - margin) {
      // not enough room on right — place to the left
      left = skill.clickX - rect.width - 30
    }
    if (left < margin) left = margin

    let top = skill.clickY - rect.height / 2
    if (top < margin) top = margin
    if (top + rect.height > window.innerHeight - margin) {
      top = window.innerHeight - rect.height - margin
    }

    el.style.left = left + 'px'
    el.style.top = top + 'px'

    // animation origin closer to click
    const originX = ((skill.clickX - left) / rect.width) * 100
    const originY = ((skill.clickY - top) / rect.height) * 100
    el.style.setProperty('--origin-x', originX + '%')
    el.style.setProperty('--origin-y', originY + '%')
  }, [skill])

  const baseInfo = SKILL_INFO[skill.name] || {
    descKey: 'descSoon',
    years: 1,
    projects: [],
  }
  // Override years from API-supplied skill if present (don't mutate the shared map).
  const info = typeof skill.years === 'number' && skill.years > 0
    ? { ...baseInfo, years: skill.years }
    : baseInfo

  const description = t(lang, info.descKey)
  const projects = info.projects.map((p) =>
    typeof p === 'string' ? p : t(lang, p.key)
  )

  return (
    <div className="skill-comment" ref={ref}>
      <div className="skill-comment__body">
        <button className="skill-comment__close" onClick={onClose} aria-label={t(lang, 'close')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <p className="skill-comment__name">{t(lang, 'fullName')}</p>
        <p className="skill-comment__role">{t(lang, 'role')}</p>

        <span className="skill-comment__skill-badge">{t(lang, 'aboutTech')}</span>
        <h3 className="skill-comment__skill-name">{skill.name}</h3>

        <p className="skill-comment__text">{description}</p>

        <div className="skill-comment__meta">
          <span>
            <span className="skill-comment__meta-value">{skill.level}%</span>
            {t(lang, 'level')}
          </span>
          <span>
            <span className="skill-comment__meta-value">{info.years}</span>
            {info.years === 1 ? t(lang, 'year1') : info.years < 5 ? t(lang, 'year24') : t(lang, 'year5')} {t(lang, 'yearsExp')}
          </span>
        </div>

        {projects.length > 0 && (
          <div className="skill-comment__projects">
            <p className="skill-comment__projects-label">{t(lang, 'usedIn')}</p>
            <div className="skill-comment__tags">
              {projects.map((p) => (
                <span key={p} className="skill-comment__tag">{p}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="skill-comment__avatar">BK</div>
    </div>
  )
}
