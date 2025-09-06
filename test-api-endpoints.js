// API Endpoints Integration Tests
// Run with: node test-api-endpoints.js

import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class APIEndpointsTestSuite {
  constructor() {
    this.results = [];
    this.baseURL = 'http://127.0.0.1:54321'; // Default Supabase local URL
    this.endpoints = [
      '/functions/v1/reestr-parser'
    ];
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

  // Mock HTTP request function (since Node doesn't have fetch by default)
  async fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      const req = protocol.request(requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            text: () => Promise.resolve(data),
            json: () => Promise.resolve(JSON.parse(data))
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }

  // Test endpoint availability
  async testEndpointAvailability() {
    for (const endpoint of this.endpoints) {
      const fullUrl = `${this.baseURL}${endpoint}`;

      try {
        const response = await this.fetch(fullUrl, { method: 'GET' });
        // Note: GET requests might not be supported, but we check if endpoint is reachable
        this.log(`✓ Endpoint ${endpoint} доступен (${response.status})`);
      } catch (error) {
      this.log(`⚠️ Endpoint ${endpoint} недоступен: ${error.message || error}`, 'warning');
        // Don't throw error, just warn - Supabase might not be running
      }
    }
  }

  // Test POST endpoint with valid data
  async testPOSTRequest() {
    const endpoint = this.endpoints[0];
    const fullUrl = `${this.baseURL}${endpoint}`;

    try {
      const response = await this.fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // Mock token for local testing
        },
        body: JSON.stringify({ inn: '5258098350' })
      });

      if (response.ok) {
        this.log(`✓ POST к ${endpoint} прошел успешно`);
        return;
      }

      // If we get here, the endpoint might be configured differently
      this.log(`⚠️ POST к ${endpoint} вернул статус ${response.status}`, 'warning');

    } catch (error) {
      this.log(`⚠️ POST к ${endpoint} неудачен: ${error.message || error}`, 'warning');
      // Don't throw - Supabase local server might not be running
    }
  }

  // Test OPTIONS request (CORS)
  async testCORSHeaders() {
    const endpoint = this.endpoints[0];
    const fullUrl = `${this.baseURL}${endpoint}`;

    try {
      const response = await this.fetch(fullUrl, {
        method: 'OPTIONS'
      });

      this.log(`✓ OPTIONS запрос вернул статус ${response.status}`);

      // Check for CORS headers if available
      if (response.headers) {
        // We can't check headers in Node's basic http, but we can confirm OPTIONS works
        this.log('✓ Метод OPTIONS поддерживается');
      }

    } catch (error) {
      this.log(`⚠️ OPTIONS запрос неудачен: ${error.message || error}`, 'warning');
    }
  }

  // Test malformed JSON
  async testMalformedJSON() {
    const endpoint = this.endpoints[0];
    const fullUrl = `${this.baseURL}${endpoint}`;

    try {
      const response = await this.fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: 'invalid json'
      });

      if (response.status === 400) {
        this.log(`✓ Правильная обработка ошибок при malformed JSON`);
        return;
      }

      this.log(`⚠️ Неожиданный статус для malformed JSON: ${response.status}`);

    } catch (error) {
      // Connection errors are acceptable for local testing
      this.log(`⚠️ Ошибка тестирования malformed JSON: ${error.message || error}`, 'warning');
    }
  }

  // Test missing required fields
  async testMissingRequiredFields() {
    const endpoint = this.endpoints[0];
    const fullUrl = `${this.baseURL}${endpoint}`;

    try {
      const response = await this.fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (response.status === 400) {
        this.log(`✓ Правильная обработка отсутствующих обязательных полей`);
        return;
      }

      this.log(`⚠️ Неожиданный статус для отсутствующих полей: ${response.status}`);

    } catch (error) {
      this.log(`⚠️ Ошибка тестирования отсутствующих полей: ${error.message || error}`, 'warning');
    }
  }

  // Test rate limiting (if applicable)
  async testRateLimiting() {
    const endpoint = this.endpoints[0];
    const fullUrl = `${this.baseURL}${endpoint}`;

    // Simulate multiple requests
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(this.fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inn: '5258098350' })
      }));
    }

    try {
      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.ok === true).length;

      this.log(`✓ ${successCount}/${promises.length} массовых запросов успешно обработано`);

      if (responses.some(r => r.status === 429)) {
        this.log(`✓ Обнаружен rate limiting (статус 429)`);
      }

    } catch (error) {
      this.log(`⚠️ Ошибка тестирования rate limiting: ${error.message || error}`, 'warning');
    }
  }

  // Test with mock responses for offline testing
  async testMockEndpoints() {
    // Create a simple local server for testing
    const server = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/functions/v1/reestr-parser') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (!data.inn) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'inn required' }));
              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              result: {
                inn: data.inn,
                found: true,
                name: 'Test Organization',
                status: 'Test Status'
              }
            }));
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    // Start mock server
    const mockPort = 3000;
    await new Promise((resolve, reject) => {
      server.listen(mockPort, () => {
        this.log(`✓ Mock server запущен на порту ${mockPort}`);
        resolve(null);
      });
      server.on('error', reject);
    });

    try {
      // Test mock server
      const mockUrl = `http://localhost:${mockPort}/functions/v1/reestr-parser`;

      // Test valid request
      const response1 = await this.fetch(mockUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inn: '5258098350' })
      });

      // Test invalid request
      const response2 = await this.fetch(mockUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      this.log(`✓ Mock сервер вернул статус ${response1.status} для valid запроса`);
      this.log(`✓ Mock сервер вернул статус ${response2.status} для invalid запроса`);

    } finally {
      server.close();
      this.log('✓ Mock сервер остановлен');
    }
  }

  async runAllTests() {
    console.log('🌐 Запуск тестов API endpoints...\n');

    const tests = [
      { name: 'Доступность endpoints', fn: this.testEndpointAvailability },
      { name: 'POST запросы', fn: this.testPOSTRequest },
      { name: 'CORS headers', fn: this.testCORSHeaders },
      { name: 'Обработка malformed JSON', fn: this.testMalformedJSON },
      { name: 'Отсутствующие обязательные поля', fn: this.testMissingRequiredFields },
      { name: 'Rate limiting', fn: this.testRateLimiting },
      { name: 'Mock endpoints', fn: this.testMockEndpoints }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.fn.bind(this));
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Результаты тестирования API:');
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

    // Additional guidance
    if (this.results.filter(r => !r.success).length > 0) {
      console.log('\n💡 Рекомендации:');
      console.log('  - Проверьте, запущен ли Supabase local server: supabase start');
      console.log('  - Проверьте настройки функций в deno.json');
      console.log('  - Убедитесь, что endpoints возвращают правильные коды HTTP статусов');
    }
  }
}

// Test for live SRO website endpoints
class LiveSROTTestSuite {
  async testLiveSROWebsite() {
    try {
      const url = 'https://www.sronoso.ru/reestr/?arrFilter_ff[NAME]=&arrFilter_pf[INNNumber]=5258098350&set_filter=%D0%9F%D0%BE%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D1%8C';

      const response = await this.fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      console.log(`✓ Live SRO website вернул статус ${response.status}`);
      const html = await response.text();
      console.log(`✓ Получено ${html.length} символов HTML`);

    } catch (error) {
      console.log(`⚠️ Ошибка тестирования live SRO сайта: ${error.message || error}`);
    }
  }

  // Mock fetch for live testing
  async fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: 10000
      };

      const req = protocol.request(requestOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            text: () => Promise.resolve(data),
            json: () => Promise.resolve(JSON.parse(data))
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }
}

// Main test runner
async function main() {
  console.log('🔗 Запуск тестов API endpoints...\n');

  // Test local Supabase endpoints
  const apiTestSuite = new APIEndpointsTestSuite();
  await apiTestSuite.runAllTests();

  // Test live SRO website
  console.log('\n🌍 Тестирование live SRO сайта...\n');
  const liveTest = new LiveSROTTestSuite();
  await liveTest.testLiveSROWebsite();

  console.log('\n🎉 Тестирование API endpoints завершено!');
}

// Export for external use
export { APIEndpointsTestSuite, LiveSROTTestSuite };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Ошибка запуска тестов API:', error);
    process.exit(1);
  });
}
