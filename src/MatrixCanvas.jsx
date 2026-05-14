import { useEffect, useRef } from 'react'
import { useLang } from './LangContext'
import { t } from './i18n'

const MOUSE_RADIUS = 120
const DOT_SPACING = 30
const DOT_BASE_RADIUS = 1.2

export default function MatrixCanvas() {
  const canvasRef = useRef(null)
  const { lang, setLang } = useLang()
  const langRef = useRef(lang)

  useEffect(() => {
    langRef.current = lang
  }, [lang])

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
          // Pre-calculate scatter direction for each dot (from center outward)
          const bx = c * DOT_SPACING
          const by = r * DOT_SPACING
          const cx = w / 2
          const cy = h / 2
          const sdx = bx - cx
          const sdy = by - cy
          const sDist = Math.sqrt(sdx * sdx + sdy * sdy) || 1
          // Normalized direction + random variation
          const angle = Math.atan2(sdy, sdx) + (Math.random() - 0.5) * 0.4
          const scatterDist = 800 + Math.random() * 600 // how far they fly

          dots.push({
            baseX: bx,
            baseY: by,
            x: bx,
            y: by,
            vx: 0,
            vy: 0,
            row: r,
            col: c,
            // scatter target offsets
            scatterX: Math.cos(angle) * scatterDist,
            scatterY: Math.sin(angle) * scatterDist,
            // row-based delay: top rows scatter first
            scatterDelay: r / (rowsCount - 1), // 0 for top, 1 for bottom
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

        // Calculate scatter offset for this dot
        // Dots at top (scatterDelay=0) start scattering first
        // Each dot has a "window" of scatterProgress where it activates
        const delayWindow = 0.4 // how much of the progress is "delay" range
        const dotActivation = Math.max(0, Math.min(1,
          (scatterProgress - dot.scatterDelay * delayWindow) / (1 - dot.scatterDelay * delayWindow)
        ))
        // Eased activation (ease-out cubic)
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

        // push dots away from cursor (only when not scattering)
        if (inSphere && dist > 0) {
          const force = sphereFactor * 3
          dot.vx += (dx / dist) * force
          dot.vy += (dy / dist) * force
        }

        // spring to target (base + scatter offset)
        dot.vx += (targetX - dot.x) * 0.08
        dot.vy += (targetY - dot.y) * 0.08
        dot.vx *= 0.82
        dot.vy *= 0.82
        dot.x += dot.vx
        dot.y += dot.vy

        // size and brightness based on proximity + BK reveal on zoom out
        const bkFactor = (bkMask && bkMask.has(`${dot.row},${dot.col}`)) ? (1 - zoom) / 0.3 : 0
        const radius = DOT_BASE_RADIUS + sphereFactor * 1.5 + bkFactor * 1.5
        // Fade out as dots scatter away
        const scatterAlphaFade = 1 - easedActivation * 0.8
        const alpha = (0.12 + sphereFactor * 0.4 + bkFactor * 0.6) * scatterAlphaFade

        if (alpha > 0.01) {
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.fill()
        }
      }

      // draw text (always visible)
      {
        const centerY = h / 2
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const currentLang = langRef.current

        // greeting
        ctx.font = '300 24px system-ui, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.fillText(t(currentLang, 'greeting'), w / 2, centerY - 50)

        // name
        ctx.font = 'bold 56px system-ui, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.fillText(t(currentLang, 'name'), w / 2, centerY + 10)

        // role
        ctx.font = '300 20px system-ui, sans-serif'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.fillText(t(currentLang, 'role'), w / 2, centerY + 55)

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
      // Phase 1: scrolling down zooms out (existing behavior)
      if (e.deltaY > 0) {
        if (zoom > 0.7) {
          e.preventDefault()
          zoom -= e.deltaY * 0.0008
          zoom = Math.max(0.7, zoom)
          return
        }
        // Phase 2: after zoom is at min, scatter dots
        if (scatterProgress < SCATTER_MAX) {
          e.preventDefault()
          scatterProgress += e.deltaY * 0.0012
          scatterProgress = Math.min(SCATTER_MAX, scatterProgress)
          return
        }
        // Phase 3: scatter complete — let page scroll naturally
        return
      }

      // Scrolling up: reverse the phases
      if (e.deltaY < 0) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop

        // If page is scrolled, let it scroll up naturally
        if (scrollTop > 0) return

        // Phase 2 reverse: un-scatter dots
        if (scatterProgress > 0) {
          e.preventDefault()
          scatterProgress += e.deltaY * 0.0012
          scatterProgress = Math.max(0, scatterProgress)
          return
        }

        // Phase 1 reverse: zoom back in
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
