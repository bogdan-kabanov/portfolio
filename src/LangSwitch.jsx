import { useLang } from './LangContext'
import './LangSwitch.css'

export default function LangSwitch() {
  const { lang, setLang } = useLang()

  return (
    <div className="lang-switch">
      <button
        className={lang === 'en' ? 'active' : ''}
        onClick={() => setLang('en')}
      >
        En
      </button>
      <span className="lang-switch__divider">/</span>
      <button
        className={lang === 'ru' ? 'active' : ''}
        onClick={() => setLang('ru')}
      >
        Ru
      </button>
    </div>
  )
}
