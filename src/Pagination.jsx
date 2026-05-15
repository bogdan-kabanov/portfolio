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
      const scrollY = window.scrollY
      const vh = window.innerHeight
      if (scrollY < vh * 0.5) {
        setActive(0)
      } else if (scrollY < vh * 1.5) {
        setActive(1)
      } else if (scrollY < vh * 2.5) {
        setActive(2)
      } else if (scrollY < vh * 3.5) {
        setActive(3)
      } else {
        setActive(4)
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(index) {
    const target = index * window.innerHeight
    window.scrollTo({ top: target, behavior: 'smooth' })
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
