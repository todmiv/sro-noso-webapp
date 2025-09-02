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

// Initialize monitoring and analytics
initErrorMonitoring(import.meta.env.VITE_SENTRY_DSN)
initAnalytics(import.meta.env.VITE_PLAUSIBLE_DOMAIN)

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
  basename: '/sro-noso-webapp/'
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
