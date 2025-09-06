# Тестовая инфраструктура для парсера SRO

Этот документ описывает комплексную систему тестирования для проверки всей инфраструктуры парсера данных из реестра СРО (Саморегулируемых организаций).

## 📋 Обзор

Инфраструктура тестирования включает несколько уровней проверки:

1. **Интеграционные тесты парсера** (`test-parser.js`)
2. **Валидация данных реестра** (`test-data-validation.js`)
3. **Тестирование API endpoints** (`test-api-endpoints.js`)
4. **Deno тесты для Supabase функций** (`supabase/functions/reestr-parser/`)
5. **Мастер-раннер для всех тестов** (`test-runner.js`)

## 🏗️ Компоненты инфраструктуры

### Основные файлы
- `test-parser.js` - Интеграционные тесты для проверки работы парсера с live данными
- `test-data-validation.js` - Валидация структуры и качества данных в reestr.json и local_reestr.txt
- `test-api-endpoints.js` - Тестирование HTTP endpoints и API взаимодействия
- `test-runner.js` - Общий тест-раннер для запуска всей тестовой инфраструктуры

### Supabase функции
- `supabase/functions/reestr-parser/index.ts` - Основная функция парсера
- `supabase/functions/reestr-parser/test-parser.ts` - Unit тесты для HTML парсинга
- `supabase/functions/reestr-parser/test-supabase-function.ts` - Тесты для Edge функции Supabase
- `supabase/functions/reestr-parser/README.md` - Документация функции

## 🚀 Запуск тестов

### Быстрый запуск всех тестов
```bash
# Запуск полное тестирование инфраструктуры
node test-runner.js
```

### Запуск отдельных тестов
```bash
# Интеграционные тесты парсера
node test-parser.js

# Валидация данных
node test-data-validation.js

# API endpoints
node test-api-endpoints.js

# Deno тесты Supabase функций
deno test --allow-net --allow-read supabase/functions/reestr-parser/test-parser.ts
deno test --allow-net --allow-read supabase/functions/reestr-parser/test-supabase-function.ts
```

## 📊 Покрытие тестирования

### Уровни тестирования

#### 🔧 Unit тесты
- HTML парсинг с DOMParser
- JSON структура данных
- Валидация ИНН
- Форматирование дат

#### 🔗 Интеграционные тесты
- HTTP запросы к sronoso.ru
- Работа с Supabase Edge Functions
- Консистентность данных между форматами
- Обработка сетевых ошибок

#### 🌐 API тесты
- HTTP методы и статусы
- CORS headers
- Обработка ошибок
- Rate limiting

#### 📁 Тесты данных
- Структура JSON реестра
- Валидация полей организаций
- Консистентность данных
- Кодировка файлов

## 🛠️ Настройка окружения

### Предусловия
- Node.js 16+ (с поддержкой fetch)
- Deno (для Supabase тестов)
- Файлы данных: `public/reestr.json`, `public/local_reestr.txt`

### Установка зависимостей
```bash
npm install node-fetch  # Для Node.js
```

### Запуск Supabase (при необходимости)
```bash
supabase start
```

## 📈 Результаты тестирования

Пример вывода master тест-раннера:

```
🚀 === ЗАПУСК КОМПЛЕКСНОГО ТЕСТИРОВАНИЯ INFRASTRUCTURE ПАРСЕРА ===

--- ЗАПУСК СЮИТА: ИНТЕГРАЦИОННЫЕ ТЕСТЫ ПАРСЕРА ---
✅ Проверка валидного ИНН из реестра: ✓
✅ Проверка невалидного ИНН: ✓
📊 Результаты тестирования: 2/2 тестов прошли

📊 Обзор:
  • Запущено сюитов: 4
  • Всего тестов: 15
  • Успешных: 14 (93.3%)
  • Провальных: 1 (6.7%)
  • Общее время: 2450ms

🎯 Состояние инфраструктуры: 🟢 ОТЛИЧНО
```

## 🔍 Детали тестов

### test-parser.js
**Интеграционные тесты:**
- ✅ Проверка валидного ИНН из реестра
- ✅ Обработка невалидного ИНН
- ✅ Сетевые ошибки
- ✅ Неполные данные
- ✅ Консистентность данных

### test-data-validation.js
**Валидация данных:**
- ✅ Структура JSON
- ✅ Полнота данных
- ✅ Уникальность ИНН
- ✅ Формат названий организаций
- ✅ Кодировка файлов
- ✅ Производительность

### test-api-endpoints.js
**API тестирование:**
- ✅ Доступность endpoints
- ✅ HTTP методы
- ✅ Обработка ошибок
- ✅ Rate limiting
- ✅ CORS headers

### Supabase тесты
**Edge функция:**
- ✅ HTML парсинг
- ✅ HTTP обработка
- ✅ Error handling
- ✅ Mock режим

## 📋 Метрики и отчеты

### Генерация отчетов
```bash
node test-runner.js  # Автоматически генерирует JSON отчет
```

### Структура отчета
```json
{
  "timestamp": "2025-09-06T19:25:00.000Z",
  "summary": {
    "totalSuites": 4,
    "totalTests": 15,
    "passedTests": 14,
    "failedTests": 1,
    "totalDuration": 2450
  },
  "environment": {
    "nodeVersion": "v18.17.0",
    "platform": "win32",
    "arch": "x64"
  }
}
```

## 🚨 Обработка ошибок

### Типичные проблемы

#### Сетевые ошибки
```
⚠️ Endpoint недоступен: ECONNREFUSED
```
**Решение:** Проверить доступность sronoso.ru

#### Отсутствующие файлы
```
❌ Файл reestr.json не найден
```
**Решение:** Проверить наличие файлов в директории public/

#### Supabase не запущен
```
⚠️ Supabase function HTTP 500
```
**Решение:** `supabase start`

### Debug режим
```bash
NODE_DEBUG=test-verbose node test-runner.js
```

## 🔄 CI/CD интеграция

### GitHub Actions пример
```yaml
- name: Run Parser Tests
  run: node test-runner.js

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: test-report
    path: test-report-*.json
```

### Exit codes
- `0` - Все тесты прошли
- `1` - Есть проваленные тесты
- `2` - Критическая ошибка системы

## 📚 Документация

### Архитектура тестов
```
tests/
├── test-runner.js       # Мастер-раннер
├── test-parser.js       # Интеграционные тесты
├── test-data-validation.js # Валидация данных
├── test-api-endpoints.js   # API тесты
└── supabase/
    └── functions/
        └── reestr-parser/
            ├── test-parser.ts       # Deno unit тесты
            └── test-supabase-function.ts # Edge функция тесты
```

### Соглашения по коду
- Все тесты используют async/await
- Результаты логируются с emoji
- Ошибки обрабатываются gracefully
- Отчеты сохраняются в JSON формате

## 🎯 Лучшие практики

### Написание новых тестов
1. Использовать описательные имена функций
2. Добавлять проверки edge cases
3. Мокировать внешние зависимости
4. Включать проверки производительности

### Мониторинг
- Запускать полный тест-сюит перед деплоем
- Мониторить покрытие тестов
- Проверять регрессии при изменениях

## 📞 Поддержка

При возникновении проблем:
1. Проверить логи ошибок
2. Убедиться в доступности внешних сервисов
3. Проверить конфигурацию окружения
4. Запустить тесты в verbose режиме

---

**Версия:** 1.0.0
**Дата:** 2025-09-06
**Обновлено:** Регулярно с развитием инфраструктуры
