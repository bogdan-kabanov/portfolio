import { useState, useEffect } from 'react'
import { useLang } from './LangContext'
import { t } from './i18n'
import './GitHubRepos.css'

const GITHUB_USERNAME = 'bogdan-kabanov'

// Language colors (GitHub style)
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  PHP: '#4F5D95',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Shell: '#89e051',
  Vue: '#41b883',
  Dart: '#00B4AB',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
}

export default function GitHubRepos() {
  const { lang } = useLang()
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchRepos()
  }, [])

  async function fetchRepos() {
    try {
      const response = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30&type=owner`
      )
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()

      // Filter out forks, sort by stars then updated
      const filtered = data
        .filter((r) => !r.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 12)

      setRepos(filtered)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (error) return null

  return (
    <section id="github" className="github-repos" aria-label={t(lang, 'githubRepos')}>
      <h2 className="github-repos__title">{t(lang, 'githubRepos')}</h2>
      <p className="github-repos__subtitle">{t(lang, 'githubReposSubtitle')}</p>

      {loading ? (
        <div className="github-repos__loading">
          <div className="github-repos__spinner" />
        </div>
      ) : (
        <div className="github-repos__grid">
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="github-repo-card"
            >
              <div className="github-repo-card__header">
                <svg
                  className="github-repo-card__icon"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  width="16"
                  height="16"
                >
                  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
                </svg>
                <span className="github-repo-card__name">{repo.name}</span>
              </div>

              {repo.description && (
                <p className="github-repo-card__desc">{repo.description}</p>
              )}

              {repo.topics && repo.topics.length > 0 && (
                <div className="github-repo-card__topics">
                  {repo.topics.map((topic) => (
                    <span key={topic} className="github-repo-card__topic">
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              <div className="github-repo-card__meta">
                {repo.language && (
                  <span className="github-repo-card__lang">
                    <span
                      className="github-repo-card__lang-dot"
                      style={{
                        backgroundColor:
                          LANG_COLORS[repo.language] || '#8b949e',
                      }}
                    />
                    {repo.language}
                  </span>
                )}

                {repo.stargazers_count > 0 && (
                  <span className="github-repo-card__stat">
                    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
                    </svg>
                    {repo.stargazers_count}
                  </span>
                )}

                {repo.forks_count > 0 && (
                  <span className="github-repo-card__stat">
                    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                      <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
                    </svg>
                    {repo.forks_count}
                  </span>
                )}

                {repo.homepage && (
                  <span
                    className="github-repo-card__website"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      window.open(repo.homepage, '_blank', 'noopener,noreferrer')
                    }}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        e.stopPropagation()
                        window.open(repo.homepage, '_blank', 'noopener,noreferrer')
                      }
                    }}
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                      <path d="M4.75 7.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" />
                      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" />
                    </svg>
                    Demo
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      <a
        href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`}
        target="_blank"
        rel="noopener noreferrer"
        className="github-repos__view-all"
      >
        {t(lang, 'githubViewAll')}
        <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
          <path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l2.97-2.97H3.75a.75.75 0 0 1 0-1.5h7.44L8.22 4.03a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </a>
    </section>
  )
}
