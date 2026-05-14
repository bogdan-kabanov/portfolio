import { useRef, useState } from 'react'

export default function ProjectCard({ title, image, onClick }) {
  const cardRef = useRef(null)
  const [transform, setTransform] = useState('')
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 })

  function handleMouseMove(e) {
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8

    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`)
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    })
  }

  function handleMouseLeave() {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)')
    setGlare({ x: 50, y: 50, opacity: 0 })
  }

  return (
    <article
      ref={cardRef}
      className="project-card"
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
      role="listitem"
      tabIndex={0}
      aria-label={title}
    >
      {image ? (
        <img src={image} alt={title} className="project-card__img" loading="lazy" />
      ) : (
        <div className="project-card__placeholder" aria-hidden="true">
          {title.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div
        className="project-card__glare"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
        }}
      />
      <div className="project-card__overlay">
        <h3 className="project-card__title">{title}</h3>
      </div>
    </article>
  )
}
