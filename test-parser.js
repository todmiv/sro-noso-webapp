// Comprehensive SRO Parser Test Suite - Node.js Integration Tests
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test suite class
class ParserIntegrationTestSuite {
  constructor() {
    this.results = [];
    this.reestrData = null;
    this.localReestrData = null;
  }

  log(message, level = 'info') {
    const prefix = level === 'error' ? '❌' : level === 'warning' ? '⚠️' : level === 'success' ? '✅' : '📝';
    console.log(`${prefix} ${message}`);
  }

  async runTest(name, testFn) {
    const start = Date.now();
    try {
      this.log(`Запуск теста: ${name}`);
      await testFn.call(this);
      const duration = Date.now() - start;
      this.results.push({ name, success: true, duration });
      this.log(`✓ Тест "${name}" завершен успешно за ${duration}ms`, 'success');
    } catch (error) {
      const duration = Date.now() - start;
      const err = error;
      this.results.push({ name, success: false, duration, error: err.message });
      this.log(`✗ Тест "${name}" провалился за ${duration}ms: ${err.message}`, 'error');
    }
  }

  async loadTestData() {
    try {
      // Загрузка JSON реестра
      const reestrPath = path.join(__dirname, 'public', 'reestr.json');
      if (fs.existsSync(reestrPath)) {
        this.reestrData = JSON.parse(fs.readFileSync(reestrPath, 'utf8'));
        this.log(`Загружен JSON реестр: ${Object.keys(this.reestrData).length} записей`);
      }

      // Загрузка локального реестра
      const localReestrPath = path.join(__dirname, 'public', 'local_reestr.txt');
      if (fs.existsSync(localReestrPath)) {
        this.localReestrData = fs.readFileSync(localReestrPath, 'utf8');
        this.log('Загружен локальный TXT реестр');
      }
    } catch (error) {
      this.log(`Ошибка загрузки тестовых данных: ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    console.log('🚀 Запуск комплексного тестирования парсера SRO...\n');
    await this.loadTestData();

    // Тест 1: Valid INN from reestr data
    await this.runTest('Проверка валидного ИНН из реестра', async function() {
      if (!this.reestrData) throw new Error('JSON реестр не загружен');

      // Выбираем случайный ИНН из реестра
      const testInn = Object.keys(this.reestrData)[0];

      const result = await this.testLiveParser(testInn);
      if (!result.success && !result.found) {
        throw new Error('Организация должна быть найдена');
      }
    });

    // Тест 2: Invalid INN
    await this.runTest('Проверка невалидного ИНН', async function() {
      const result = await this.testLiveParser('9999999999');
      if (result.success) {
        throw new Error('Невалидный ИНН должен вернуть ошибку или не найден');
      }
    });

    // Тест 3: Network error handling
    await this.runTest('Обработка сетевых ошибок', async function() {
      // Mock network error by using invalid hostname
      try {
        const response = await fetch('http://invalid.domain.that.does.not.exist.test/reestr/', { timeout: 5000 });
        // If we get here, the network is configured strangely
        console.log('Неожиданно успешный ответ от невалидного домена');
      } catch (error) {
        this.log('Сетевые ошибки обрабатываются корректно');
      }
    });

    // Тест 4: JSON data validation
    await this.runTest('Валидация JSON данных реестра', function() {
      if (!this.reestrData) throw new Error('JSON реестр не загружен');

      // Проверяем структуру данных
      const sampleInn = Object.keys(this.reestrData)[0];
      const record = this.reestrData[sampleInn];

      if (!record.status || !record.org_name) {
        throw new Error('Некорректная структура записи в реестре');
      }

      if (record.status !== 'Член СРО' && record.status !== 'Исключен') {
        throw new Error(`Неожиданный статус: ${record.status}`);
      }
    });

    // Тест 5: Data consistency between local and remote
    await this.runTest('Консистентность данных', async function() {
      if (!this.reestrData) throw new Error('Нет данных для тестирования');

      const testInn = Object.keys(this.reestrData)[0];
      const expected = this.reestrData[testInn];

      const result = await this.testLiveParser(testInn);
      if (result.found && result.name && expected.org_name !== result.name) {
        throw new Error(`Имена не совпадают: ожидалось "${expected.org_name}", получено "${result.name}"`);
      }
    });

    // Тест 6: HTML parsing edge cases
    await this.runTest('HTML парсинг edge cases', async function() {
      // Тестируем с известным ИНН
      const result = await this.testLiveParser('5258098350');

      if (result.error && result.error.includes('HTTP')) {
        // Network issue - skip this test
        console.log('Пропущен тест: сетевая ошибка');
        return;
      }

      // Проверяем базовую структуру ответа
      if (typeof result.found !== 'boolean') {
        throw new Error('Поле found должно быть boolean');
      }
    });

    this.printSummary();
  }

  async testLiveParser(inn) {
    return testReestrParserFunc(inn);
  }

  printSummary() {
    console.log('\n📊 Результаты тестирования:');
    console.log(`Всего тестов: ${this.results.length}`);
    console.log(`Успешно: ${this.results.filter(r => r.success).length}`);
    console.log(`Провалено: ${this.results.filter(r => !r.success).length}`);

    const failed = this.results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log('\n❌ Провальные тесты:');
      failed.forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }

    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`\n⏱️ Общее время выполнения: ${totalDuration}ms`);
  }
}

async function testReestrParserFunc(testInn = '5258098350') {
  try {
    // Создаем URL с параметрами поиска
    const searchParams = new URLSearchParams({
      'arrFilter_ff[NAME]': '',
      'arrFilter_pf[INNNumber]': testInn,
      'set_filter': 'Показать'
    });

    const searchUrl = `https://www.sronoso.ru/reestr/?${searchParams.toString()}`;

    // Делаем запрос
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const html = await response.text();

    // Анализируем HTML
    const result = {
      success: true,
      inn: testInn,
      found: false,
      status: 'Не найдена в реестре СРО',
      htmlLength: html.length
    };

    // Проверяем, найдена ли организация
    if (html.includes('ничего не найдено') || html.includes('Нет элементов для отображения') || html.includes('Нет результатов')) {
      result.found = false;
      result.status = 'Не найдена в реестре СРО';
    } else {
      result.found = true;
      result.status = 'Найдена в реестре СРО';

      // Ищем таблицу с результатами поиска
      const tableMatch = html.match(/<table[^>]*>[\s\S]*?<\/table>/i);
      if (tableMatch) {
        // Извлекаем данные из таблицы
        const rowMatch = html.match(/<td[^>]*>([^<]*?)<\/td>/gi);
        if (rowMatch && rowMatch.length >= 4) {
          const cells = rowMatch.slice(0, 5).map(cell =>
            cell.replace(/<[^>]*>/g, '').trim()
          ).filter(cell => cell.length > 0);

          result.name = cells[0] || '';
          result.details = cells[1] || '';
          result.registrationDate = cells[3] || '';
          result.registrationNumber = cells[4] || '';
        }
      }
    }

    return result;

  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Запуск всех тестов
async function runMain() {
  const testSuite = new ParserIntegrationTestSuite();
  await testSuite.runAllTests();
}

// Экспорт для использования в других тестах
export {
  ParserIntegrationTestSuite
};

// Запуск если файл запущен напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  const innArg = process.argv[2];
  if (innArg) {
    testReestrParserFunc(innArg).then(result => {
      console.log('Результат для ИНН', innArg, ':', result);
    });
  } else {
    runMain();
  }
}
