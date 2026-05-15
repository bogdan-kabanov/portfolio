import { useEffect, useRef } from 'react'
import { useLang } from './LangContext'
import { t } from './i18n'

const MOUSE_RADIUS = 120
const DOT_SPACING = 30
const DOT_BASE_RADIUS = 1.2

// GitHub username
const GITHUB_USERNAME = 'bogdan-kabanov'

export default function MatrixCanvas() {
  const canvasRef = useRef(null)
  const { lang, setLang } = useLang()
  const langRef = useRef(lang)
  const githubDataRef = useRef(null) // { weeks: [[day0, day1, ...day6], ...], maxCount }

  useEffect(() => {
    langRef.current = lang
  }, [lang])

  // Fetch GitHub contribution data
  useEffect(() => {
    fetchGitHubContributions()
  }, [])

  async function fetchGitHubContributions() {
    try {
      // Use GitHub's contribution calendar via the public events API
      // We'll fetch the contribution graph from the profile page SVG
      const response = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
      )
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()

      // data.contributions is an array of { date, count, level }
      // We need to organize it into weeks (columns) x days (rows)
      const contributions = data.contributions || []

      // Group by week
      const weeks = []
      let currentWeek = []

      for (let i = 0; i < contributions.length; i++) {
        const date = new Date(contributions[i].date)
        const dayOfWeek = date.getDay() // 0=Sun, 6=Sat

        if (dayOfWeek === 0 && currentWeek.length > 0) {
          weeks.push(currentWeek)
          currentWeek = []
        }
        currentWeek.push(contributions[i].count)
      }
      if (currentWeek.length > 0) {
        weeks.push(currentWeek)
      }

      const maxCount = Math.max(1, ...contributions.map((c) => c.count))

      githubDataRef.current = { weeks, maxCount }
    } catch (err) {
      // Fallback: generate mock data so the visual still works
      const weeks = []
      for (let w = 0; w < 52; w++) {
        const week = []
        for (let d = 0; d < 7; d++) {
          week.push(Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 12))
        }
        weeks.push(week)
      }
      githubDataRef.current = { weeks, maxCount: 12 }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let w, h
    let dots = []
    let mouse = { x: -9999, y: -9999 }
    let light = { x: -9999, y: -9999, vx: 0, vy: 0 }
    let zoom = 1

    // Scatter effect: progress from 0 (no scatter) to 1 (fully scattered)
    let scatterProgress = 0
    const SCATTER_MAX = 1

    // BK letter mask — built once on resize
    let bkMask = null // Set of "row,col" strings that are part of BK letters

    function buildBkMask() {
      const offCanvas = document.createElement('canvas')
      const offCtx = offCanvas.getContext('2d')
      offCanvas.width = Math.ceil(w / DOT_SPACING) + 1
      offCanvas.height = Math.ceil(h / DOT_SPACING) + 1

      const fontSize = Math.floor(offCanvas.height * 0.6)
      offCtx.fillStyle = '#000'
      offCtx.fillRect(0, 0, offCanvas.width, offCanvas.height)
      offCtx.font = `bold ${fontSize}px system-ui, sans-serif`
      offCtx.fillStyle = '#fff'
      offCtx.textAlign = 'center'
      offCtx.textBaseline = 'middle'
      offCtx.fillText('BK', offCanvas.width / 2, offCanvas.height / 2)

      const imageData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height)
      const data = imageData.data
      bkMask = new Set()

      for (let y = 0; y < offCanvas.height; y++) {
        for (let x = 0; x < offCanvas.width; x++) {
          const i = (y * offCanvas.width + x) * 4
          if (data[i] > 128) {
            bkMask.add(`${y},${x}`)
          }
        }
      }
    }

    function buildDots() {
      dots = []
      const colsCount = Math.ceil(w / DOT_SPACING) + 1
      const rowsCount = Math.ceil(h / DOT_SPACING) + 1

      for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < colsCount; c++) {
          const bx = c * DOT_SPACING
          const by = r * DOT_SPACING
          const cx = w / 2
          const cy = h / 2
          const angle =
            Math.atan2(by - cy, bx - cx) + (Math.random() - 0.5) * 0.4
          const scatterDist = 800 + Math.random() * 600

          dots.push({
            baseX: bx,
            baseY: by,
            x: bx,
            y: by,
            vx: 0,
            vy: 0,
            row: r,
            col: c,
            scatterX: Math.cos(angle) * scatterDist,
            scatterY: Math.sin(angle) * scatterDist,
            scatterDelay: r / (rowsCount - 1),
          })
        }
      }
    }

    function resize() {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w
      canvas.height = h
      buildDots()
      buildBkMask()
    }

    let frame = 0

    function draw() {
      frame++

      // elastic light
      const springStrength = 0.06
      const damping = 0.82
      let localMouseX = -9999
      let localMouseY = -9999
      if (mouse.x > -9000) {
        localMouseX = (mouse.x - w / 2) / zoom + w / 2
        localMouseY = (mouse.y - h / 2) / zoom + h / 2
      }
      if (localMouseX > -9000) {
        light.vx += (localMouseX - light.x) * springStrength
        light.vy += (localMouseY - light.y) * springStrength
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

      ctx.save()
      ctx.translate(w / 2, h / 2)
      ctx.scale(zoom, zoom)
      ctx.translate(-w / 2, -h / 2)

      // draw dots
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]

        const delayWindow = 0.4
        const dotActivation = Math.max(
          0,
          Math.min(
            1,
            (scatterProgress - dot.scatterDelay * delayWindow) /
              (1 - dot.scatterDelay * delayWindow)
          )
        )
        const easedActivation = 1 - Math.pow(1 - dotActivation, 3)

        const scatterOffX = dot.scatterX * easedActivation
        const scatterOffY = dot.scatterY * easedActivation

        const targetX = dot.baseX + scatterOffX
        const targetY = dot.baseY + scatterOffY

        const dx = targetX - light.x
        const dy = targetY - light.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        const inSphere = dist < MOUSE_RADIUS && scatterProgress < 0.1
        const sphereFactor = inSphere ? 1 - dist / MOUSE_RADIUS : 0

        if (inSphere && dist > 0) {
          const force = sphereFactor * 3
          dot.vx += (dx / dist) * force
          dot.vy += (dy / dist) * force
        }

        dot.vx += (targetX - dot.x) * 0.08
        dot.vy += (targetY - dot.y) * 0.08
        dot.vx *= 0.82
        dot.vy *= 0.82
        dot.x += dot.vx
        dot.y += dot.vy

        const bkFactor =
          bkMask && bkMask.has(`${dot.row},${dot.col}`)
            ? (1 - zoom) / 0.3
            : 0
        const radius = DOT_BASE_RADIUS + sphereFactor * 1.5 + bkFactor * 1.5
        const scatterAlphaFade = 1 - easedActivation * 0.8
        const alpha =
          (0.12 + sphereFactor * 0.4 + bkFactor * 0.6) * scatterAlphaFade

        if (alpha > 0.01) {
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.fill()
        }
      }

      // Draw GitHub Activity Graph
      drawGitHubGraph(ctx, w, h, frame)

      // draw text (always visible)
      {
        const centerY = h / 2
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const currentLang = langRef.current

        const nameFontSize = Math.min(56, w * 0.08)
        const greetingFontSize = Math.min(24, w * 0.04)
        const roleFontSize = Math.min(20, w * 0.035)

        // greeting
        ctx.font = `300 ${greetingFontSize}px system-ui, sans-serif`
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.fillText(
          t(currentLang, 'greeting'),
          w / 2,
          centerY - nameFontSize * 0.8
        )

        // name
        ctx.font = `bold ${nameFontSize}px system-ui, sans-serif`
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.fillText(t(currentLang, 'name'), w / 2, centerY)

        // role
        ctx.font = `300 ${roleFontSize}px system-ui, sans-serif`
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.fillText(
          t(currentLang, 'role'),
          w / 2,
          centerY + nameFontSize * 0.8
        )

        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
      }

      // vignette
      const vcx = w / 2
      const vcy = h / 2
      const maxR = Math.max(vcx, vcy) * 1.1
      const grad = ctx.createRadialGradient(vcx, vcy, maxR * 0.5, vcx, vcy, maxR)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(1, 'rgba(0,0,0,0.6)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      ctx.restore()

      animId = requestAnimationFrame(draw)
    }

    function drawGitHubGraph(ctx, w, h, frame) {
      const ghData = githubDataRef.current
      if (!ghData) return

      const { weeks, maxCount } = ghData

      // Graph positioning — bottom area of the canvas, centered
      const cellSize = Math.max(6, Math.min(12, w * 0.009))
      const cellGap = Math.max(2, cellSize * 0.25)
      const totalCellSize = cellSize + cellGap

      const numWeeks = weeks.length
      const numDays = 7

      const graphWidth = numWeeks * totalCellSize
      const graphHeight = numDays * totalCellSize

      const startX = (w - graphWidth) / 2
      const startY = h * 0.72

      // Subtle label
      ctx.save()
      ctx.font = `300 ${Math.max(10, cellSize)}px system-ui, sans-serif`
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText('GitHub Activity', w / 2, startY - cellSize)
      ctx.restore()

      // Draw cells
      for (let weekIdx = 0; weekIdx < numWeeks; weekIdx++) {
        const week = weeks[weekIdx]
        for (let dayIdx = 0; dayIdx < week.length; dayIdx++) {
          const count = week[dayIdx]
          const x = startX + weekIdx * totalCellSize
          const y = startY + dayIdx * totalCellSize

          // Intensity level (0-4 like GitHub)
          const intensity = count === 0 ? 0 : Math.min(4, Math.ceil((count / maxCount) * 4))

          // Color based on intensity — matrix green theme
          let r, g, b, a
          switch (intensity) {
            case 0:
              r = 255; g = 255; b = 255; a = 0.04
              break
            case 1:
              r = 0; g = 220; b = 100; a = 0.2
              break
            case 2:
              r = 0; g = 220; b = 100; a = 0.4
              break
            case 3:
              r = 0; g = 255; b = 100; a = 0.6
              break
            case 4:
              r = 0; g = 255; b = 80; a = 0.85
              break
            default:
              r = 255; g = 255; b = 255; a = 0.04
          }

          // Subtle pulse animation for active cells
          if (intensity > 0) {
            const pulse =
              Math.sin(frame * 0.02 + weekIdx * 0.1 + dayIdx * 0.2) * 0.1
            a = Math.min(1, a + pulse * intensity * 0.05)
          }

          // Mouse proximity glow effect
          const cellCenterX = x + cellSize / 2
          const cellCenterY = y + cellSize / 2
          const dxMouse = cellCenterX - light.x
          const dyMouse = cellCenterY - light.y
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse)

          if (distMouse < MOUSE_RADIUS * 1.5) {
            const proximity = 1 - distMouse / (MOUSE_RADIUS * 1.5)
            a = Math.min(1, a + proximity * 0.3)
            if (intensity === 0) {
              g = 220
              b = 100
              r = 0
              a = proximity * 0.15
            }
          }

          // Draw rounded rect (dot-style)
          const cornerRadius = cellSize * 0.2
          ctx.beginPath()
          if (ctx.roundRect) {
            ctx.roundRect(x, y, cellSize, cellSize, cornerRadius)
          } else {
            // Fallback for older browsers
            ctx.moveTo(x + cornerRadius, y)
            ctx.lineTo(x + cellSize - cornerRadius, y)
            ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + cornerRadius)
            ctx.lineTo(x + cellSize, y + cellSize - cornerRadius)
            ctx.quadraticCurveTo(x + cellSize, y + cellSize, x + cellSize - cornerRadius, y + cellSize)
            ctx.lineTo(x + cornerRadius, y + cellSize)
            ctx.quadraticCurveTo(x, y + cellSize, x, y + cellSize - cornerRadius)
            ctx.lineTo(x, y + cornerRadius)
            ctx.quadraticCurveTo(x, y, x + cornerRadius, y)
            ctx.closePath()
          }
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
          ctx.fill()
        }
      }
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

    function onWheel(e) {
      if (e.deltaY > 0) {
        if (zoom > 0.7) {
          e.preventDefault()
          zoom -= e.deltaY * 0.0008
          zoom = Math.max(0.7, zoom)
          return
        }
        if (scatterProgress < SCATTER_MAX) {
          e.preventDefault()
          scatterProgress += e.deltaY * 0.0012
          scatterProgress = Math.min(SCATTER_MAX, scatterProgress)
          return
        }
        return
      }

      if (e.deltaY < 0) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop

        if (scrollTop > 0) return

        if (scatterProgress > 0) {
          e.preventDefault()
          scatterProgress += e.deltaY * 0.0012
          scatterProgress = Math.max(0, scatterProgress)
          return
        }

        if (zoom < 1) {
          e.preventDefault()
          zoom -= e.deltaY * 0.0008
          zoom = Math.min(1, zoom)
          return
        }
      }
    }

    function onClick(e) {
      // no longer used for lang switch
    }

    resize()
    draw()

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('click', onClick)
    window.addEventListener('resize', resize)

    return () => {
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('click', onClick)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [])

  return <canvas ref={canvasRef} className="matrix-canvas" aria-hidden="true" />
}
