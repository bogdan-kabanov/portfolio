import { useEffect, useState, useRef } from 'react'
import { useLang } from './LangContext'
import { t } from './i18n'
import './ProjectDetail.css'

function Lightbox({ src, onClose, hintText, altText }) {
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function handleWheel(e) {
    e.preventDefault()
    e.stopPropagation()
    setScale((s) => Math.min(3, Math.max(1, s - e.deltaY * 0.002)))
  }

  function handleMouseDown(e) {
    if (e.target.tagName === 'IMG') {
      dragging.current = true
      lastPos.current = { x: e.clientX, y: e.clientY }
    }
  }

  function handleMouseMove(e) {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }

    setPos((p) => {
      // limit panning to ±200px
      const maxPan = 200
      return {
        x: Math.max(-maxPan, Math.min(maxPan, p.x + dx)),
        y: Math.max(-maxPan, Math.min(maxPan, p.y + dy)),
      }
    })
  }

  function handleMouseUp() {
    dragging.current = false
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="project-detail__lightbox"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleBackdropClick}
    >
      <button className="project-detail__lightbox-close" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <img
        className="project-detail__lightbox-img"
        src={src}
        alt={altText}
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
        }}
        draggable={false}
      />
      <span className="project-detail__lightbox-hint">{hintText}</span>
    </div>
  )
}

export default function ProjectDetail({ project, onClose }) {
  const [step, setStep] = useState(0)
  const [lightboxImg, setLightboxImg] = useState(null)
  const { lang } = useLang()

  useEffect(() => {
    // sequential reveal: image -> title -> description -> tech
    const timers = []
    timers.push(setTimeout(() => setStep(1), 50))   // image
    timers.push(setTimeout(() => setStep(2), 400))  // title
    timers.push(setTimeout(() => setStep(3), 700))  // description
    timers.push(setTimeout(() => setStep(4), 1000)) // tech
    return () => timers.forEach(clearTimeout)
  }, [])

  function handleClose() {
    setStep(0)
    setTimeout(onClose, 400)
  }

  return (
    <article className="project-detail" aria-label={project.title}>
      <button className="project-detail__back" onClick={handleClose} aria-label={t(lang, 'back')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
          <path d="M19 12H5" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        {t(lang, 'back')}
      </button>

      <div className="project-detail__content">
        <figure className={`project-detail__image ${step >= 1 ? 'visible' : ''}`}>
          {project.images && project.images.length > 0 ? (
            <div className="project-detail__gallery">
              {project.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${project.title} — скриншот ${i + 1}`}
                  loading="lazy"
                  onClick={() => setLightboxImg(img)}
                />
              ))}
            </div>
          ) : project.image ? (
            <img src={project.image} alt={project.title} loading="lazy" />
          ) : (
            <div className="project-detail__image-placeholder" aria-hidden="true">
              {project.title.slice(0, 2).toUpperCase()}
            </div>
          )}
        </figure>

        <div className="project-detail__info">
          <h2 className={`project-detail__title ${step >= 2 ? 'visible' : ''}`}>
            {project.title}
          </h2>

          <p className={`project-detail__desc ${step >= 3 ? 'visible' : ''}`}>
            {project.description}
          </p>

          <div className={`project-detail__tech ${step >= 4 ? 'visible' : ''}`}>
            <h3>{t(lang, 'technologies')}</h3>
            <ul className="project-detail__tags" aria-label={t(lang, 'technologies')}>
              {project.tech.map((tech) => (
                <li key={tech} className="project-detail__tag">{tech}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {lightboxImg && (
        <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} hintText={t(lang, 'zoomHint')} altText={t(lang, 'enlargedPhoto')} />
      )}
    </article>
  )
}
