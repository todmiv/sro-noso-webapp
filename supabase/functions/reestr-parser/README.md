# SRO Reestr Parser

Supabase Edge Function для парсинга данных организаций из реестра СРО НОСО.

## Description (Описание)

Функция извлекает данные организаций из реестра СРО НОСО (https://www.sronoso.ru/reestr/) по номеру ИНН.
Использует скрейпинг с помощью HTML парсинга и DOMParser.

## Features (Возможности)

✅ Полный парсинг таблицы результатов с сайта
✅ Подробное логирование каждого шага
✅ Обработка ошибок и нестабильности сайта
✅ Mock режим для локального тестирования
✅ Полная совместимость с Supabase Edge Runtime

## API Usage (Использование API)

```bash
POST /functions/v1/reestr-parser
Content-Type: application/json

{
  "inn": "5258098350"
}
```

### Response Format (Формат ответа)

```json
{
  "success": true,
  "result": {
    "inn": "5258098350",
    "name": "ООО СТК «Грейт»",
    "status": "Член СРО",
    "registrationDate": "30.08.2022",
    "found": true
  },
  "timestamp": "2025-09-06T12:00:00.000Z"
}
```

### Error Responses (Ошибки)

- `404`: ИНН не найден в реестре
- `500`: Ошибка сервера или сети

## Local Development (Локальная разработка)

### Mock Mode (Тестовый режим)
Функция автоматически включает mock режим когда нет Authorization header, возвращая тестовые данные для локального тестирования без JWT проблем.

### Real Scraping (Реальный скрейпинг)
Для получения реальных данных с сайта используйте valid JWT token для Supabase.

## Testing (Тестирование)

Запуск тестов:
```bash
deno run --allow-net --allow-read supabase/functions/reestr-parser/test-parser.ts
```

Тесты покрывают:
- Парсинг валидных данных
- Обработка пустых результатов
- Edge cases (пустые ячейки таблиц)
- Производительность
- Валидация запросов

## VSCode TypeScript Errors (Ошибки VSCode)

VSCode может показывать TypeScript ошибки типа:
- `Не удается найти файл определения типа для edge-runtime.d.ts`
- `Не удается найти имя "Deno"`

**Это нормально** - эти ошибки возникают потому что:
1. VSCode использует Node.js конфигурацию TypeScript
2. Deno runtime имеет другой API
3. В Supabase Deno функции работают корректно, игнорируя эти VSCode предупреждения

## Dependencies (Зависимости)

- Доступ к интеренету для скрейпинга сайта sronoso.ru
- Deno runtime (в Supabase Edge Functions)
- DOMParser API

## Security Note (Примечание по безопасности)

Функция парсит данные с публичного сайта, но:
- Уважайте `robots.txt` сайта
- Не перегружайте сервер частыми запросами
- Используйте правильные User-Agent заголовки

## Troubleshooting (Проблемы и решения)

### 401 Unauthorized в локальной разработке
- Установлено `needs_auth: false` в deno.json
- Если всё ещё 401 - используйте mock режим (без auth header)

### Пустые результаты
- Проверьте список сайта - возможно структура изменилась
- Функция возвращает debug информацию с HTML сниппетом

### TypeScript ошибки в VSCode
- Игнорируйте - они от VSCode IDE, не от Deno runtime
- Функции работают корректно в Supabase

## Git History

Function adapted from original scraper on 2025-09-06 with following updates:
- Deno runtime compatibility
- HTML parsing with DOMParser
- Detailed logging with emojis
- Mock mode for local testing
- Comprehensive unit tests
- Error handling and edge cases
