import { useState, useEffect } from 'react'
import './App.css'
import MatrixCanvas from './MatrixCanvas'
import ProjectCard from './ProjectCard'
import ProjectDetail from './ProjectDetail'
import Pagination from './Pagination'
import ScrollIndicator from './ScrollIndicator'
import SocialLinks from './SocialLinks'
import CustomCursor from './CustomCursor'
import SkillsSection from './SkillsSection'
import LangSwitch from './LangSwitch'
import ExperienceSection from './ExperienceSection'
import GitHubRepos from './GitHubRepos'
import Footer from './Footer'
import { useLang } from './LangContext'
import { t } from './i18n'

const projectsData = [
  {
    titleKey: 'krotminerTitle',
    descKey: 'krotminerDesc',
    image: null,
    tech: ['React', 'TypeScript', 'Node.js', 'WebSocket', 'Telegram Mini App', 'Canvas API', 'PostgreSQL', 'REST API', 'CSS Animations', 'Docker'],
  },
  {
    titleKey: 'daoTitle',
    descKey: 'daoDesc',
    image: null,
    tech: ['React Native', 'TypeScript', 'Node.js', 'ZKP (zk-SNARKs)', 'Swagger', 'PostgreSQL', 'REST API', 'WebSocket', 'Solidity'],
  },
  {
    titleKey: 'bastaxiTitle',
    descKey: 'bastaxiDesc',
    image: null,
    tech: ['Angular', 'React', 'TypeScript', 'GraphQL', 'Apollo Client', 'Node.js', 'PostgreSQL', 'SCSS'],
  },
  {
    titleKey: 'unionTitle',
    descKey: 'unionDesc',
    image: null,
    tech: ['React', 'TypeScript', 'Node.js', 'Telegram Bot API', 'Telegram Mini App', 'PostgreSQL', 'REST API'],
  },
  {
    titleKey: 'blockmindTitle',
    descKey: 'blockmindDesc',
    image: import.meta.env.BASE_URL + 'blockmind/01-dashboard.png',
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
    titleKey: 'floraTitle',
    descKey: 'floraDesc',
    image: null,
    tech: ['Laravel', 'PHP', 'MySQL', 'Eloquent ORM', 'Blade', 'HTML', 'CSS', 'Bootstrap', 'JavaScript', 'REST API'],
  },
  {
    titleKey: 'carautoTitle',
    descKey: 'carautoDesc',
    image: null,
    tech: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS/SCSS', 'REST API', 'Responsive Design'],
  },
]

function App() {
  const [selectedProject, setSelectedProject] = useState(null)
  const { lang } = useLang()

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t(lang, 'pageTitle')
  }, [lang])

  const projects = projectsData.map((p) => ({
    ...p,
    title: t(lang, p.titleKey),
    description: t(lang, p.descKey),
  }))

  return (
    <div className="app">
      <CustomCursor />
      <Pagination />
      <SocialLinks />
      <LangSwitch />

      <main id="main" className="app__main">
        <section
          id="hero"
          className="hero-section"
          aria-label={t(lang, 'navHome')}
        >
          <header className="hero-section__header">
            <h1 className="visually-hidden">
              {t(lang, 'fullName')} — {t(lang, 'role')}
            </h1>
          </header>
          <MatrixCanvas />
          <ScrollIndicator />
        </section>

        <section
          id="projects"
          className="projects-section"
          aria-label={t(lang, 'projects')}
        >
          {selectedProject === null ? (
            <>
              <h2 className="projects-title">{t(lang, 'projects')}</h2>
              <div className="projects-grid" role="list">
                {projects.map((p, i) => (
                  <ProjectCard
                    key={p.titleKey}
                    title={p.title}
                    image={p.image}
                    onClick={() => setSelectedProject(i)}
                  />
                ))}
              </div>
            </>
          ) : (
            <ProjectDetail
              project={projects[selectedProject]}
              onClose={() => setSelectedProject(null)}
            />
          )}
        </section>

        <SkillsSection />

        <GitHubRepos />

        <ExperienceSection />
      </main>

      <Footer />
    </div>
  )
}

export default App
