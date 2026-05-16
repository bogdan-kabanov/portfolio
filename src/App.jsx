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
import Blog from './Blog'
import Footer from './Footer'
import { useLang } from './LangContext'
import { t } from './i18n'
import { usePortfolio, resolveLocalized } from './PortfolioContext'

function App() {
  const [selectedProject, setSelectedProject] = useState(null)
  const { lang } = useLang()
  const { projects: rawProjects } = usePortfolio()

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t(lang, 'pageTitle')
  }, [lang])

  // Reset selection if the dataset shrinks (e.g. project deleted while viewing).
  useEffect(() => {
    if (selectedProject !== null && selectedProject >= rawProjects.length) {
      setSelectedProject(null)
    }
  }, [rawProjects.length, selectedProject])

  const projects = rawProjects.map((p) => ({
    ...p,
    // unify image fields used by ProjectCard / ProjectDetail
    image: p.cover || (p.images && p.images[0]) || null,
    title: resolveLocalized(p, lang, 'title', t),
    description: resolveLocalized(p, lang, 'description', t),
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
                    key={p.id || p.titleKey || i}
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
      <Blog />
    </div>
  )
}

export default App
