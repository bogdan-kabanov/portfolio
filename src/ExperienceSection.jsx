import { useEffect, useRef } from 'react'
import { useLang } from './LangContext'
import { t } from './i18n'
import './ExperienceSection.css'

const experienceData = [
  {
    company: 'Union',
    roleKey: 'expUnion1Role',
    duration: '1',
    durationKey: 'year1',
  },
  {
    company: 'Union',
    roleKey: 'expUnion2Role',
    duration: '2',
    durationKey: 'year24',
  },
  {
    company: 'Bastaxi',
    roleKey: 'expBastaxiRole',
    duration: '1',
    durationKey: 'year1',
  },
  {
    company: 'BlockMind',
    roleKey: 'expBlockmindRole',
    duration: '1',
    durationKey: 'year1',
  },
  {
    company: 'KrotMiner',
    roleKey: 'expKrotminerRole',
    duration: '1',
    durationKey: 'year1',
  },
]

export default function ExperienceSection() {
  const { lang } = useLang()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let w, h

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w
      canvas.height = h
    }

    // 6 lines from top-left corner spreading to right/bottom edges
    const endpoints = [
      { xRatio: 0.2, yRatio: 1.0 },
      { xRatio: 0.4, yRatio: 1.0 },
      { xRatio: 0.65, yRatio: 1.0 },
      { xRatio: 0.9, yRatio: 1.0 },
      { xRatio: 1.0, yRatio: 0.55 },
      { xRatio: 1.0, yRatio: 0.2 },
    ]

    let frame = 0

    function draw() {
      frame++
      ctx.clearRect(0, 0, w, h)

      const time = frame * 0.005

      // Sort endpoints by angle for filling between them
      const points = endpoints.map((ep) => ({
        x: ep.xRatio * w,
        y: ep.yRatio * h,
      }))

      // Fill inverted (light) areas between alternating pairs of rays
      for (let i = 0; i < points.length - 1; i += 2) {
        const p1 = points[i]
        const p2 = points[i + 1]

        const pulse = 0.7 + 0.3 * Math.sin(time + i * 0.8)
        const alpha = 0.025 * pulse

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.closePath()
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fill()
      }

      // Draw the 5 lines
      for (let i = 0; i < points.length; i++) {
        const p = points[i]
        const pulse = 0.6 + 0.4 * Math.sin(time * 1.5 + i * 1.2)
        const alpha = 0.1 * pulse

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(p.x, p.y)
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    draw()

    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <section id="experience" className="experience-section" aria-label={t(lang, 'experience')}>
      <canvas ref={canvasRef} className="experience-section__canvas" aria-hidden="true" />

      <h2 className="experience-section__title">{t(lang, 'experience')}</h2>
      <p className="experience-section__subtitle">{t(lang, 'experienceSubtitle')}</p>

      <div className="experience-section__timeline">
        {experienceData.map((item, i) => (
          <div className="experience-card" key={i}>
            <div className="experience-card__dot" />
            <div className="experience-card__content">
              <span className="experience-card__company">{item.company}</span>
              <span className="experience-card__role">{t(lang, item.roleKey)}</span>
              <span className="experience-card__duration">
                {item.duration} {t(lang, item.durationKey)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
