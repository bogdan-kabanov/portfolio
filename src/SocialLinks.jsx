import { useState } from 'react'
import { useLang } from './LangContext'
import { t } from './i18n'
import './SocialLinks.css'

const PHONE = '+7 (999) 123-45-67'
const EMAIL = 'bogdankabanovprof@gmail.com'

export default function SocialLinks() {
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const { lang } = useLang()

  function handleCopyPhone() {
    navigator.clipboard.writeText(PHONE).then(() => {
      setCopiedPhone(true)
      setTimeout(() => setCopiedPhone(false), 2000)
    })
  }

  function handleCopyEmail() {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    })
  }

  return (
    <aside className="social-links" aria-label={lang === 'ru' ? 'Контакты' : 'Contacts'}>
      <a
        href="https://t.me/bogdan_kabanova"
        target="_blank"
        rel="noopener noreferrer"
        className="social-links__item"
        aria-label="Telegram"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      </a>

      <button type="button" className="social-links__email" onClick={handleCopyEmail} aria-label={lang === 'ru' ? 'Скопировать email' : 'Copy email'}>
        <span className="social-links__item" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M20 18h-2V9.25L12 13 6 9.25V18H4V6h1.2l6.8 4.25L18.8 6H20m0-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
          </svg>
        </span>
        <span className="social-links__email-text">
          {copiedEmail ? t(lang, 'copied') : EMAIL}
        </span>
      </button>

      <button type="button" className="social-links__phone" onClick={handleCopyPhone} aria-label={lang === 'ru' ? 'Скопировать телефон' : 'Copy phone'}>
        <span className="social-links__item" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
        </span>
        <span className="social-links__phone-number">
          {copiedPhone ? t(lang, 'copied') : PHONE}
        </span>
      </button>
    </aside>
  )
}
