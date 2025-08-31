// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    lazy: async () => {
      const { default: LoginPage } = await import('./pages/LoginPage');
      return { Component: LoginPage };
    }
  },
  {
    path: "/documents",
    lazy: async () => {
      const { default: DocumentsPage } = await import('./pages/DocumentsPage');
      return { Component: DocumentsPage };
    }
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
    <RouterProvider router={router} />
  </React.StrictMode>
)