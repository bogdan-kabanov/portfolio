import { useState } from 'react'
import { useLang } from './LangContext'
import { t } from './i18n'
import './Footer.css'

const EMAIL = 'bogdankabanovprof@gmail.com'

export default function Footer() {
  const { lang } = useLang()
  const year = new Date().getFullYear()
  const [copied, setCopied] = useState(false)

  function handleCopyEmail() {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <div className="footer__left">
          <span className="footer__name">{t(lang, 'name')}</span>
          <span className="footer__role">{t(lang, 'role')}</span>
        </div>

        <address className="footer__center">
          <a
            href="https://t.me/bogdan_kabanova"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            Telegram
          </a>
          <span className="footer__divider" aria-hidden="true">·</span>
          <button type="button" className="footer__email" onClick={handleCopyEmail}>
            {copied ? t(lang, 'copied') : EMAIL}
          </button>
        </address>

        <div className="footer__right">
          <small className="footer__copy">© {year} bogdan-kabanov</small>
        </div>
      </div>
    </footer>
  )
}
