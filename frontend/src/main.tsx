import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/authContext'
import { MeetingProvider } from './context/meetingContext.tsx'
import { DriveProvider } from './context/driveContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <MeetingProvider>
        <DriveProvider>
      <App />
      </DriveProvider>
      </MeetingProvider>
    </AuthProvider>

  </StrictMode>,
)
