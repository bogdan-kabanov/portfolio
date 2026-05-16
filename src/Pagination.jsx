import { useState, useEffect } from 'react'
import { useLang } from './LangContext'
import { t } from './i18n'
import './Pagination.css'

export default function Pagination() {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(null)
  const { lang } = useLang()

  const sections = [
    { id: 'hero', labelKey: 'navHome' },
    { id: 'projects', labelKey: 'navProjects' },
    { id: 'skills', labelKey: 'navSkills' },
    { id: 'github', labelKey: 'navGithub' },
    { id: 'experience', labelKey: 'navExperience' },
  ]

  useEffect(() => {
    function onScroll() {
      // Use real section offsets so layout changes (post detail, project detail)
      // don't break the active-dot logic.
      const scrollY = window.scrollY + window.innerHeight * 0.4
      let next = 0
      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i].id)
        if (!el) continue
        if (el.offsetTop <= scrollY) next = i
      }
      setActive(next)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(index) {
    const el = document.getElementById(sections[index].id)
    if (el) {
      window.scrollTo({ top: el.offsetTop, behavior: 'smooth' })
    }
  }

  return (
    <nav className="pagination" aria-label={lang === 'ru' ? 'Навигация по секциям' : 'Section navigation'}>
      {sections.map((s, i) => (
        <button
          key={s.id}
          type="button"
          className={`pagination__item ${active === i ? 'active' : ''}`}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => scrollTo(i)}
          aria-label={t(lang, s.labelKey)}
          aria-current={active === i ? 'true' : undefined}
        >
          <span className="pagination__dot" aria-hidden="true" />
          <span
            className={`pagination__label ${hovered === i ? 'visible' : ''}`}
            aria-hidden="true"
          >
            {t(lang, s.labelKey)}
          </span>
        </button>
      ))}
    </nav>
  )
}
