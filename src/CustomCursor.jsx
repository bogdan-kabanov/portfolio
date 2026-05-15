import { useEffect, useRef, useState } from 'react'
import './CustomCursor.css'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current

    let mouseX = -100, mouseY = -100
    let ringX = -100, ringY = -100

    function onMouseMove(e) {
      mouseX = e.clientX
      mouseY = e.clientY
      // dot follows instantly
      dot.style.left = mouseX + 'px'
      dot.style.top = mouseY + 'px'
    }

    function onMouseOver(e) {
      const tag = e.target.closest('a, button, [role="button"], .project-card')
      setHovering(!!tag)
    }

    // ring follows with elastic delay
    function animate() {
      const dx = mouseX - ringX
      const dy = mouseY - ringY
      ringX += dx * 0.25
      ringY += dy * 0.25
      ring.style.left = ringX + 'px'
      ring.style.top = ringY + 'px'
      requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseover', onMouseOver)
    const animId = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="custom-cursor__dot" />
      <div ref={ringRef} className={`custom-cursor__ring ${hovering ? 'hovering' : ''}`} />
    </>
  )
}
