// Tiny safe markdown → HTML renderer.
// Supports headings (#..######), bold (**), italic (*), inline `code`,
// fenced ```code blocks```, unordered (- *) and ordered (1.) lists,
// links [text](url), and paragraphs. All HTML in input is escaped first.

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inline(text) {
  // 1) inline code first to protect from other transforms
  let out = text.replace(/`([^`]+?)`/g, (_, c) => `\u0001CODE${encodeURIComponent(c)}\u0001`)
  // 2) bold
  out = out.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
  // 3) italic
  out = out.replace(/(^|[^*])\*([^*]+?)\*(?!\*)/g, '$1<em>$2</em>')
  // 4) links — only http(s)/mailto/relative for safety
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, href) => {
    const safe = /^(https?:\/\/|mailto:|\/)/i.test(href) ? href : '#'
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${t}</a>`
  })
  // 5) restore inline code
  out = out.replace(/\u0001CODE([^\u0001]+)\u0001/g, (_, c) => `<code>${decodeURIComponent(c)}</code>`)
  return out
}

export function renderMarkdown(src) {
  if (!src) return ''
  const escaped = escapeHtml(src)
  const lines = escaped.split(/\r?\n/)
  const out = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // fenced code block
    if (/^```/.test(line)) {
      const buf = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i])
        i++
      }
      i++ // skip closing ```
      out.push(`<pre><code>${buf.join('\n')}</code></pre>`)
      continue
    }

    // heading
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      const level = h[1].length
      out.push(`<h${level}>${inline(h[2])}</h${level}>`)
      i++
      continue
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const buf = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        buf.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`)
        i++
      }
      out.push(`<ul>${buf.join('')}</ul>`)
      continue
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        buf.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`)
        i++
      }
      out.push(`<ol>${buf.join('')}</ol>`)
      continue
    }

    // blank line
    if (/^\s*$/.test(line)) {
      i++
      continue
    }

    // paragraph (collapse adjacent non-empty/non-block lines)
    const buf = [line]
    i++
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^(#{1,6}\s|```|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])
    ) {
      buf.push(lines[i])
      i++
    }
    out.push(`<p>${inline(buf.join(' '))}</p>`)
  }

  return out.join('\n')
}

export function readingTimeMinutes(text) {
  if (!text) return 1
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
