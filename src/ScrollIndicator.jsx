import { useLang } from './LangContext'
import { t } from './i18n'
import './ScrollIndicator.css'

export default function ScrollIndicator() {
  const { lang } = useLang()
  return (
    <div className="scroll-indicator" role="presentation" aria-hidden="true">
      <div className="scroll-mouse">
        <div className="scroll-wheel"></div>
      </div>
      <span className="scroll-text">{t(lang, 'scroll')}</span>
    </div>
  )
}
