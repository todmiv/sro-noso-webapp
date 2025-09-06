// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastProvider } from './components/ToastProvider'
import { AuthProvider } from './contexts/AuthContext'
import { initErrorMonitoring } from './utils/errorMonitoring'
import { initAnalytics } from './utils/analytics'
import './index.css'

// Initialize monitoring and analytics (optional - disabled if no DSN/domain configured)
if (import.meta.env.VITE_SENTRY_DSN && !import.meta.env.VITE_SENTRY_DSN.includes('your_')) {
  initErrorMonitoring(import.meta.env.VITE_SENTRY_DSN)
}
if (import.meta.env.VITE_PLAUSIBLE_DOMAIN && !import.meta.env.VITE_PLAUSIBLE_DOMAIN.includes('your_')) {
  initAnalytics(import.meta.env.VITE_PLAUSIBLE_DOMAIN)
}

// Configure basename based on environment
// For GitHub Pages deployment: '/sro-noso-webapp/'
// For local development: undefined (root path)
const basename = import.meta.env.VITE_BASENAME || (import.meta.env.DEV ? undefined : '/sro-noso-webapp/');

console.log('Router basename:', basename);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: HomePage } = await import('./pages/HomePage');
          return { Component: HomePage };
        }
      },
      {
        path: "login",
        lazy: async () => {
          const { default: LoginPage } = await import('./pages/LoginPage');
          return { Component: LoginPage };
        }
      },
      {
        path: "documents",
        lazy: async () => {
          const { default: DocumentsPage } = await import('./pages/DocumentsPage');
          return { Component: DocumentsPage };
        }
      },
      {
        path: "chat",
        lazy: async () => {
          const { default: ChatAgentPage } = await import('./pages/ChatAgentPage');
          return { Component: ChatAgentPage };
        }
      },
      {
        path: "document/:id",
        lazy: async () => {
          const { default: DocumentViewPage } = await import('./pages/DocumentViewPage');
          return { Component: DocumentViewPage };
        }
      },
      {
        path: "profile",
        lazy: async () => {
          const { default: ProfilePage } = await import('./pages/ProfilePage');
          return {
            Component: () => (
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            )
          };
        }
      }
    ]
  }
], {
  basename: basename
})

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
)
