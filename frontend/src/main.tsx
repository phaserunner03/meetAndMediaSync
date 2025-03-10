import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/authContext'
import { MeetingProvider } from './context/meetingContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MeetingProvider>
      <App />
      
      </MeetingProvider>
    </AuthProvider>

  </StrictMode>,
)
