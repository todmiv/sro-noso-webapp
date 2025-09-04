// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

interface SROEntry {
  inn: string;
  name: string;
  status: string;
  registrationDate: string;
  found: boolean;
}

interface RequestData {
  inn: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    const { inn } = await req.json()

    if (!inn || typeof inn !== 'string') {
      return new Response(
        JSON.stringify({
          error: "INN parameter is required and must be a string"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      )
    }

    console.log(`Searching for INN: ${inn}`)

    // Создаем URL с параметрами поиска для формы СРО
    const searchParams = new URLSearchParams({
      'arrFilter_ff[NAME]': '',
      'arrFilter_pf[INNNumber]': inn,
      'set_filter': 'Показать'
    })

    const searchUrl = `https://www.sronoso.ru/reestr/?${searchParams.toString()}`

    console.log(`Search URL: ${searchUrl}`)

    // Делаем запрос с таймаутом 5 секунд
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    console.log(`HTML response length: ${html.length}`)

    // Парсим результат поиска
    const result: SROEntry = {
      inn: inn,
      name: '',
      status: '',
      registrationDate: '',
      found: false
    }

    console.log('HTML preview (first 1000 chars):', html.substring(0, 1000))

    // Ищем данные в HTML
    // Расширенный поиск по паттернам об отсутствии результатов
    const noResultsPatterns = [
      'ничего не найдено',
      'Не найдены элементы',
      'Нет элементов для отображения',
      'Результатов не найдено',
      'не найдено',
      'По вашему запросу ничего не найдено'
    ]

    const hasNoResults = noResultsPatterns.some(pattern =>
      html.toLowerCase().includes(pattern.toLowerCase())
    )

    if (hasNoResults) {
      result.found = false
      result.status = 'Не найдена в реестре СРО'
    } else {
      // Ищем таблицу с результатами поиска
      const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/i);

      if (tableMatch) {
        // Проверяем, есть ли данные в таблице (ищем td с содержимым)
        const rowMatch = html.match(/<td[^>]*>([^<]*?)<\/td>/gi);
        const hasData = rowMatch && rowMatch.length >= 2 &&
                        rowMatch.some(cell => cell.replace(/<[^>]*>/g, '').trim().length > 0)

        if (hasData) {
          result.found = true
          result.status = 'Найдена в реестре СРО'

          // Пытаемся извлечь информацию из таблицы
          const cells = rowMatch.slice(0, 5).map(cell =>
            cell?.replace(/<[^>]*>/g, '').trim() || ''
          )

          result.name = cells[0] || ''
          result.registrationDate = cells[3] || ''
        } else {
          result.found = false
          result.status = 'Не найдена в реестре СРО'
        }
      } else {
        result.found = false
        result.status = 'Не найдена в реестре СРО'
      }
    }

    // Возвращаем результат
    const data = {
      success: true,
      result: result,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } },
    )

  } catch (error) {
    console.error('Error in reestr-parser:', error)

    const err = error as any
    if (err.name === 'AbortError') {
      return new Response(
        JSON.stringify({
          error: "Timeout: request took too long (5 seconds)",
          timestamp: new Date().toISOString()
        }),
        {
          status: 408,
          headers: { "Content-Type": "application/json" }
        }
      )
    }

    return new Response(
      JSON.stringify({
        error: `Internal error: ${err.message || 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reestr-parser' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
