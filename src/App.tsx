import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DocumentsPage from './pages/DocumentsPage';
import DocumentViewPage from './pages/DocumentViewPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/document/:id" element={<DocumentViewPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;