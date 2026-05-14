import { useEffect, useRef, useState } from 'react'
import { useLang } from './LangContext'
import { t } from './i18n'
import './SkillsSection.css'
import SkillModal from './SkillModal'

const CATEGORIES = [
  {
    id: 'all',
    title: 'Все',
    skills: [
      { name: 'React', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Next.js', level: 85 },
      { name: 'Node.js', level: 90 },
      { name: 'PostgreSQL', level: 85 },
      { name: 'MySQL', level: 80 },
      { name: 'Git', level: 90 },
      { name: 'GitHub', level: 90 },
      { name: 'GitLab', level: 85 },
      { name: 'PHP', level: 80 },
      { name: 'Laravel', level: 75 },
      { name: 'Python', level: 70 },
      { name: 'REST API', level: 95 },
      { name: 'WebSocket', level: 80 },
      { name: 'HTML', level: 95 },
      { name: 'CSS / SCSS', level: 90 },
      { name: 'Tailwind', level: 85 },
      { name: 'Bootstrap', level: 80 },
      { name: 'WordPress', level: 75 },
      { name: 'React Native', level: 80 },
      { name: 'Angular', level: 75 },
      { name: 'Vue', level: 70 },
      { name: 'Swagger', level: 85 },
      { name: 'ZKP', level: 75 },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    skills: [
      { name: 'React', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Next.js', level: 85 },
      { name: 'Angular', level: 75 },
      { name: 'Vue', level: 70 },
      { name: 'React Native', level: 80 },
      { name: 'HTML', level: 95 },
      { name: 'CSS / SCSS', level: 90 },
      { name: 'Tailwind', level: 85 },
      { name: 'Bootstrap', level: 80 },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    skills: [
      { name: 'Node.js', level: 90 },
      { name: 'PHP', level: 80 },
      { name: 'Laravel', level: 75 },
      { name: 'Python', level: 70 },
      { name: 'REST API', level: 95 },
      { name: 'WebSocket', level: 80 },
      { name: 'WordPress', level: 75 },
      { name: 'Swagger', level: 85 },
      { name: 'ZKP', level: 75 },
    ],
  },
  {
    id: 'data',
    title: 'Data & DevOps',
    skills: [
      { name: 'PostgreSQL', level: 85 },
      { name: 'MySQL', level: 80 },
      { name: 'Git', level: 90 },
      { name: 'GitHub', level: 90 },
      { name: 'GitLab', level: 85 },
    ],
  },
]

export default function SkillsSection() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedSkill, setSelectedSkill] = useState(null)
  const skillsRef = useRef(CATEGORIES[0].skills)
  const onSkillClickRef = useRef(null)
  const { lang } = useLang()

  // keep latest setter accessible from canvas effect
  onSkillClickRef.current = (skill) => setSelectedSkill(skill)

  // update skills ref when category changes
  useEffect(() => {
    skillsRef.current = CATEGORIES.find((c) => c.id === activeCategory).skills
    // trigger rebuild via custom event
    canvasRef.current?.dispatchEvent(new Event('rebuild'))
  }, [activeCategory])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let w, h
    let nodes = [] // skill nodes
    let dots = [] // background dots
    let mouse = { x: -9999, y: -9999 }
    let light = { x: -9999, y: -9999, vx: 0, vy: 0 }
    let hoveredNode = null

    const DOT_SPACING = 30
    const MOUSE_RADIUS = 130

    function buildBackgroundDots() {
      dots = []
      const colsCount = Math.ceil(w / DOT_SPACING) + 1
      const rowsCount = Math.ceil(h / DOT_SPACING) + 1
      for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < colsCount; c++) {
          dots.push({
            baseX: c * DOT_SPACING,
            baseY: r * DOT_SPACING,
            x: c * DOT_SPACING,
            y: r * DOT_SPACING,
            vx: 0,
            vy: 0,
          })
        }
      }
    }

    function buildSkillNodes() {
      const skills = skillsRef.current
      const isMobile = w < 600
      const isSmall = w < 400
      const radius = isSmall
        ? Math.min(w, h) * 0.28
        : isMobile
          ? Math.min(w, h) * 0.30
          : Math.min(w, h) * 0.34
      const cx = w / 2
      // Account for category buttons at the bottom
      const buttonsArea = isMobile ? 60 : 80
      const cy = (h - buttonsArea) / 2

      const nodeScale = isSmall ? 0.6 : isMobile ? 0.75 : 1

      nodes = skills.map((s, i) => {
        const angle = (i / skills.length) * Math.PI * 2 - Math.PI / 2
        const x = cx + Math.cos(angle) * radius
        const y = cy + Math.sin(angle) * radius
        return {
          name: s.name,
          level: s.level,
          baseX: x,
          baseY: y,
          x,
          y,
          vx: 0,
          vy: 0,
          phase: Math.random() * Math.PI * 2,
          radius: (4 + s.level / 25) * nodeScale,
          scale: nodeScale,
        }
      })
    }

    function resize() {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
      buildBackgroundDots()
      buildSkillNodes()
    }

    function rebuild() {
      buildSkillNodes()
    }

    let frame = 0

    function draw() {
      frame++

      // elastic light
      const springStrength = 0.06
      const damping = 0.82
      if (mouse.x > -9000) {
        light.vx += (mouse.x - light.x) * springStrength
        light.vy += (mouse.y - light.y) * springStrength
        light.vx *= damping
        light.vy *= damping
        light.x += light.vx
        light.y += light.vy
      } else {
        light.x = -9999
        light.y = -9999
      }

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, w, h)

      // background dots
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]
        const dx = dot.baseX - light.x
        const dy = dot.baseY - light.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const inSphere = dist < MOUSE_RADIUS
        const sphereFactor = inSphere ? 1 - dist / MOUSE_RADIUS : 0

        if (inSphere && dist > 0) {
          dot.vx += (dx / dist) * sphereFactor * 3
          dot.vy += (dy / dist) * sphereFactor * 3
        }
        dot.vx += (dot.baseX - dot.x) * 0.05
        dot.vy += (dot.baseY - dot.y) * 0.05
        dot.vx *= 0.85
        dot.vy *= 0.85
        dot.x += dot.vx
        dot.y += dot.vy

        const radius = 1.2 + sphereFactor * 1.2
        const alpha = 0.1 + sphereFactor * 0.35
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fill()
      }

      // skill nodes
      hoveredNode = null
      const time = frame * 0.015

      // first: gentle floating motion + spring (no mouse repulsion)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]

        const targetX = n.baseX + Math.sin(time * 0.5 + n.phase) * 6
        const targetY = n.baseY + Math.cos(time * 0.4 + n.phase) * 6

        n.vx += (targetX - n.x) * 0.06
        n.vy += (targetY - n.y) * 0.06
        n.vx *= 0.85
        n.vy *= 0.85
        n.x += n.vx
        n.y += n.vy

        // check hover
        const hdx = n.x - mouse.x
        const hdy = n.y - mouse.y
        const hdist = Math.sqrt(hdx * hdx + hdy * hdy)
        if (hdist < n.radius * 2.5 + 12) {
          hoveredNode = n
        }
      }

      // draw connections to nearby nodes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 140) {
            ctx.globalAlpha = (1 - d / 140) * 0.15
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      // draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const isHovered = n === hoveredNode

        // glow
        if (isHovered) {
          const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 60)
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = gradient
          ctx.fillRect(n.x - 60, n.y - 60, 120, 120)
        }

        // node circle
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius * (isHovered ? 1.5 : 1), 0, Math.PI * 2)
        ctx.fillStyle = isHovered ? '#fff' : `rgba(255, 255, 255, ${0.4 + (n.level / 100) * 0.5})`
        ctx.fill()

        // outer ring
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.radius * 2.5, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 255, 255, ${isHovered ? 0.4 : 0.12})`
        ctx.lineWidth = 1
        ctx.stroke()

        // label always visible, bigger when hovered
        const labelSize = isHovered ? 14 * (n.scale || 1) : 12 * (n.scale || 1)
        ctx.font = `${isHovered ? 600 : 400} ${Math.round(labelSize)}px system-ui, sans-serif`
        ctx.fillStyle = isHovered ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(n.name, n.x, n.y + n.radius * 2.5 + 8)

        // level badge on hover
        if (isHovered) {
          const badgeSize = Math.round(11 * (n.scale || 1))
          ctx.font = `600 ${badgeSize}px system-ui, sans-serif`
          ctx.fillStyle = 'rgba(255,255,255,0.6)'
          ctx.fillText(n.level + '%', n.x, n.y + n.radius * 2.5 + 26)
        }
      }

      animId = requestAnimationFrame(draw)
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      if (light.x < -9000) {
        light.x = mouse.x
        light.y = mouse.y
        light.vx = 0
        light.vy = 0
      }
    }

    function onMouseLeave() {
      mouse.x = -9999
      mouse.y = -9999
      light.x = -9999
      light.y = -9999
    }

    function onClick(e) {
      // find node under cursor
      const rect = canvas.getBoundingClientRect()
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const dx = n.x - mouse.x
        const dy = n.y - mouse.y
        if (Math.sqrt(dx * dx + dy * dy) < n.radius * 2.5 + 12) {
          onSkillClickRef.current?.({
            name: n.name,
            level: n.level,
            clickX: e.clientX,
            clickY: e.clientY,
          })
          break
        }
      }
    }

    resize()
    draw()

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    canvas.addEventListener('click', onClick)
    canvas.addEventListener('rebuild', rebuild)
    window.addEventListener('resize', resize)

    return () => {
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('rebuild', rebuild)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <section id="skills" className="skills-section" aria-label={t(lang, 'skills')}>
      <h2 className="skills-section__title">{t(lang, 'skills')}</h2>
      <p className="skills-section__subtitle">{t(lang, 'skillsSubtitle')}</p>

      <div className="skills-section__canvas-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} className="skills-canvas" aria-hidden="true" />

        <div className="skills-section__categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`skills-section__category ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.id === 'all' ? t(lang, 'allCat') : cat.id === 'frontend' ? t(lang, 'frontend') : cat.id === 'backend' ? t(lang, 'backend') : t(lang, 'dataDevops')}
            </button>
          ))}
        </div>
      </div>

      {selectedSkill && (
        <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
      )}
    </section>
  )
}
