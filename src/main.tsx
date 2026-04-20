import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppErrorBoundary } from './components/ErrorBoundary.tsx'

const root = document.getElementById('root');
if (!root) {
  document.body.textContent = 'Fatal: #root element not found.';
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
