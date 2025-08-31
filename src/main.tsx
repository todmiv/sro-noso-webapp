// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

// Получаем элемент контейнера
const container = document.getElementById('root');

// Проверяем, что контейнер существует
if (container) {
  // Создаем корневой элемент React
  const root = ReactDOM.createRoot(container);
  // Рендерим приложение
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
} else {
  // Обрабатываем случай, если элемент не найден (например, выводим ошибку в консоль)
  console.error("Критическая ошибка: Элемент с ID 'root' не найден в DOM. Приложение не может быть запущено.");
  // Или можно отобразить сообщение об ошибке непосредственно в документе:
  // document.body.innerHTML = "<h1>Критическая ошибка загрузки приложения. Элемент 'root' не найден.</h1>";
}
