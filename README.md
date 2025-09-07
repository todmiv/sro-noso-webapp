# Веб-платформа СРО НОСО (MVP)

🌐 Современная веб-платформа для членов **Саморегулируемой организации строителей Нижегородской области (СРО НОСО)** с системой реального парсинга реестра и ИИ-консультантом.

## ✨ Основные возможности

### 🔐 Аутентификация через ИНН
- **Реальный парсинг** реестра СРО НОСО (`https://www.sronoso.ru/reestr/`)
- **Проверка существования** организации по ИНН
- **Создание профиля** с данными организации
- Mock аутентификация для быстрого доступа

### 📚 Каталог документов
- **50+ PDF документов** СРО НОСО по категориям
- **Умный поиск** по названию документа
- **Быстрый просмотр** Google Docs Viewer
- **Прямая загрузка** файлов

### 🤖 ИИ-консультант по документам
- **DeepSeek AI** с контекстом RAG
- **Ответы на русском** языке
- **Встроенный чат** с историей сообщений
- **Быстрые кнопки** для типовых вопросов

## 🚀 Быстрый запуск

### Требования
- **Node.js** 18+ (рекомендуется 20+)
- **VS Code** с расширениями: TypeScript, ESLint
- **Git** для клонирования репозитория

### Установка и запуск

```bash
# Клонирование репозитория
git clone https://github.com/todmiv/sro-noso-webapp.git
cd sro-noso-webapp

# Установка зависимостей
npm install

# Для локального тестирования скрапера
npm install puppeteer --save-dev

# Запуск сервера разработки
npm run dev
```

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Supabase Configuration (для production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Для локального тестирования
VITE_SUPABASE_URL_LOCAL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY_LOCAL=your-local-key

# Мониторинг (опционально)
VITE_SENTRY_DSN=your-sentry-dsn
VITE_PLAUSIBLE_DOMAIN=your-domain.com
```

## 🏗️ Архитектура

### Frontend
- **React 18** с TypeScript
- **Vite 5** - сборщик для быстрого обновления
- **Tailwind CSS 4** - утилитарный CSS фреймворк
- **React Router DOM** - маршрутизация страниц

### Backend
- **Supabase Edge Functions** - бессерверная архитектура
- **Deno Runtime** - безопасный JavaScript/TypeScript фреймворк
- **PostgreSQL** - реляционная база данных

### ИИ и инструменты
- **DeepSeek API** для генерации ответов
- **RAG контекст** с 20+ документами СРО
- **GitHub Pages** - бесплатный хостинг

## 📁 Структура проекта

```
sro-noso-webapp/
├── src/
│   ├── components/     # Переиспользуемые компоненты
│   ├── contexts/       # React Context API
│   ├── pages/          # Страницы приложения
│   ├── utils/          # Утилиты и помощники
│   └── assets/         # Статические ресурсы
├── supabase/
│   └── functions/      # Edge Functions (Deno)
│       └── reestr-parser/  # API для парсинга
├── public/
│   └── documents/      # PDF файлы (GitHub Release)
└── test-*.js           # Тестирование функционала
```

## 🧪 Тестирование

### Запуск unit-тестов
```bash
# Тесты Supabase функций (Deno)
cd supabase/functions/reestr-parser
deno test --allow-net test-parser.ts

# Тесты API эндпоинтов
node test-function.js
```

### Тестирование скрапера локально
```bash
# Проверка real скрапера с ИНН
node scraper.cjs 5217000301

# Вывод: {"status": "Член СРО", "org_name": "АО «КМ»", ...}
```

### Проверенные ИНН для тестирования
- `5217000301` → АО «КМ» (Член СРО, 17.05.2021)
- `5258133445` → ООО СК «ПИРС» (Член СРО, 02.04.2024)

## 🚀 Развёртывание

### GitHub Pages
```bash
# Сборка для production
npm run build

# Развёртывание
npm run deploy
```

### Supabase Functions
```bash
# Deploy функции в production
supabase functions deploy reestr-parser
```

## 🌟 Особенности реализации

### Реальный парсинг реестра
- Использование **Deno DOM parser** для анализа HTML
- **HTTP-only scraping** без зависимостей от Puppeteer
- Обработка куков и заголовков для стабильности

### Mock аутентификация
- Быстрое создание пользователей на основе ИНН
- Сохранение данных в localStorage
- Готовность для интеграции с Supabase Auth

### ИИ-консультант
- Контекстное обучение на документах СРО
- Сессионный чат с сохранением истории
- Быстрые кнопки для часто задаваемых вопросов

## 📊 Производительность

| Метрика | Значение |
|---------|----------|
| **Real парсинг** | 5-8 секунд |
| **Mock ответы** | 200-500 мс |
| **ИИ ответы** | 2-5 секунд |
| **Размер бандла** | ~1.2 MB |
| **Core Web Vitals** | LCP < 2.5s |

## 🔧 Разработка и вклад

### Установка для разработки
```bash
# Установка зависимостей с Puppeteer
npm install
npm install puppeteer --save-dev

# Запуск в режиме разработки
npm run dev

# Супабаз для тестирования API
supabase start
```

### Основные скрипты
```json
{
  "scripts": {
    "dev": "vite",                           // Разработка
    "build": "tsc -b && vite build",         // Сборка
    "deploy": "gh-pages -d dist",            // Деплой на GitHub Pages
    "test": "deno test --allow-net"           // Unit тесты
  }
}
```

### Контрибьюция
- Fork репозиторий
- Создайте feature branch
- Добавьте тесты для нового функционала
- Сделайте pull request с подробным описанием

## 📋 Roadmap (v1.2+)

### Планируемые улучшения
- [ ] **Supabase Auth integration** - постоянные аккаунты
- [ ] **Admin pane**l - управление пользователями
- [ ] **Advanced RAG** - улучшенная релевантность ИИ
- [ ] **Email notifications** - системные уведомления
- [ ] **ReCAPTCHA v3** - защита от ботов

### Текущий статус (v3.7.1)
- ✅ Real парсинг реестра СРО
- ✅ Mock аутентификация
- ✅ Каталог документов
- ✅ ИИ-консультант DeepSeek
- ✅ GitHub Pages хостинг
- ✅ Production deployment

## 📞 Контакты

- **СРО НОСО**: https://www.sronoso.ru/
- **Email**: dsrpkkov.noso@mail.ru
- **Проект**: https://github.com/todmiv/sro-noso-webapp

---

**Лицензия**: MIT

**Технологический стек**: React 18 + TypeScript + Vite + Supabase + Deno + Tailwind CSS + DeepSeek AI
