import { useEffect, useState } from 'react'
import { useUser } from './UserContext'
import { useLang } from './LangContext'
import { t } from './i18n'

export default function AuthModal({ initialMode = 'login', onClose }) {
  const { login, register } = useUser()
  const { lang } = useLang()
  const [mode, setMode] = useState(initialMode)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'login') {
        await login(username, password)
      } else {
        await register(username, password, displayName || username)
      }
      onClose()
    } catch (er) {
      setError(er.message)
    } finally {
      setBusy(false)
    }
  }

  function onBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="auth-backdrop" onClick={onBackdrop}>
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <div className="auth-card__header">
          <h3 className="auth-card__title">
            {mode === 'login' ? t(lang, 'authLogin') : t(lang, 'authRegister')}
          </h3>
          <button
            type="button"
            className="auth-card__close"
            onClick={onClose}
            aria-label={t(lang, 'close')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && <div className="auth-card__error">{error}</div>}

        <label className="auth-card__field">
          <span>{t(lang, 'authUsername')}</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
            minLength={3}
            maxLength={32}
          />
        </label>

        {mode === 'register' && (
          <label className="auth-card__field">
            <span>{t(lang, 'authDisplayName')}</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={64}
            />
          </label>
        )}

        <label className="auth-card__field">
          <span>{t(lang, 'authPassword')}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={6}
          />
        </label>

        <button type="submit" className="auth-card__submit" disabled={busy}>
          {busy ? '...' : t(lang, 'authSubmit')}
        </button>

        <div className="auth-card__switch">
          {mode === 'login' ? (
            <>
              {t(lang, 'authNoAccount')}{' '}
              <button type="button" onClick={() => { setMode('register'); setError(null) }}>
                {t(lang, 'authSwitchToRegister')}
              </button>
            </>
          ) : (
            <>
              {t(lang, 'authHaveAccount')}{' '}
              <button type="button" onClick={() => { setMode('login'); setError(null) }}>
                {t(lang, 'authSwitchToLogin')}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
