import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import './index.css'
import App from './App.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key – add VITE_CLERK_PUBLISHABLE_KEY to .env')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#a855f7',
          colorBackground: '#0f0f12',
          colorInputBackground: '#1a1a2e',
          colorInputText: '#e4e4e7',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'shadow-xl shadow-purple-500/10 border border-purple-500/20',
          formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
