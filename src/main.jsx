import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LangProvider } from './LangContext.jsx'
import { PortfolioProvider } from './PortfolioContext.jsx'
import { UserProvider } from './UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LangProvider>
      <UserProvider>
        <PortfolioProvider>
          <App />
        </PortfolioProvider>
      </UserProvider>
    </LangProvider>
  </StrictMode>,
)
