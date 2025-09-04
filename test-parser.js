// Test script for SRO parser
const fetch = require('node-fetch');

async function testReestrParser(testInn = '5258098350') {
  console.log(`Testing SRO parser with INN: ${testInn}`);

  try {
    // Создаем URL с параметрами поиска
    const searchParams = new URLSearchParams({
      'arrFilter_ff[NAME]': '',
      'arrFilter_pf[INNNumber]': testInn,
      'set_filter': 'Показать'
    });

    const searchUrl = `https://www.sronoso.ru/reestr/?${searchParams.toString()}`;
    console.log(`Search URL: ${searchUrl}`);

    // Делаем запрос
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
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`HTML response length: ${html.length}`);

    // Анализируем HTML
    const result = {
      inn: testInn,
      found: false,
      status: 'Не найдена в реестре СРО'
    };

    // Проверяем, найдена ли организация
    if (html.includes('ничего не найдено') || html.includes('Нет элементов для отображения')) {
      console.log('❌ Организация НЕ найдена в реестре');
    } else {
      console.log('✅ Организация НАЙДЕНА в реестре');

      // Ищем таблицу с результатами поиска
      const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/i);
      if (tableMatch) {
        console.log('📊 Найдена таблица с результатами');

        // Извлекаем данные из таблицы
        const rowMatch = html.match(/<td[^>]*>([^<]*?)<\/td>/gi);
        if (rowMatch && rowMatch.length >= 2) {
          const cells = rowMatch.slice(0, 5).map(cell =>
            cell.replace(/<[^>]*>/g, '').trim()
          ).filter(cell => cell.length > 0);

          console.log('📋 Извлеченные данные:', cells);

          result.found = true;
          result.status = 'Найдена в реестре СРО';
          result.name = cells[0] || '';
          result.registrationDate = cells[3] || '';
        }
      } else {
        console.log('⚠️  Таблица не найдена, возможно другой формат страницы');
      }
    }

    console.log('📊 Итоговый результат:', result);
    return result;

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    return { error: error.message };
  }
}

// Запуск теста
if (require.main === module) {
  testReestrParser(process.argv[2]);
}

module.exports = { testReestrParser };
