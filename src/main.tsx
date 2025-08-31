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
    lazy: () => import('./pages/LoginPage'),
  },
  {
    path: "/documents",
    lazy: () => import('./pages/DocumentsPage'),
  }
], {
  basename: '/sro-noso-webapp/'
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
