// Master Test Runner for SRO Parser Infrastructure
// Run with: node test-runner.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ParserIntegrationTestSuite } from './test-parser.js';
import { APIEndpointsTestSuite, LiveSROTTestSuite } from './test-api-endpoints.js';
import { DataValidationTestSuite } from './test-data-validation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class MasterTestRunner {
  constructor() {
    this.testSuites = [];
    this.overallResults = {
      totalSuites: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
      startTime: Date.now(),
      endTime: null
    };
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      error: '❌',
      warning: '⚠️',
      success: '✅',
      info: '📝',
      header: '🚀'
    }[level] || '📝';

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  registerTestSuite(name, suiteClass, ...args) {
    const suite = new suiteClass(...args);
    suite.name = name;
    this.testSuites.push(suite);
  }

  async runAllSuites() {
    this.log('=== ЗАПУСК КОМПЛЕКСНОГО ТЕСТИРОВАНИЯ INFRASTRUCTURE ПАРСЕРА ===', 'header');

    for (const suite of this.testSuites) {
      this.log(`\n--- ЗАПУСК СЮИТА: ${suite.name.toUpperCase()} ---`, 'header');
      console.log('='.repeat(60));

      const suiteStart = Date.now();

      try {
        // Run the suite (assuming runAllTests method exists)
        if (typeof suite.runAllTests === 'function') {
          await suite.runAllTests();

          // Capture results if available
          if (suite.results) {
            const suitePassed = suite.results.filter(r => r.success).length;
            const suiteFailed = suite.results.filter(r => !r.success).length;
            const suiteDuration = Date.now() - suiteStart;

            this.overallResults.totalTests += suite.results.length;
            this.overallResults.passedTests += suitePassed;
            this.overallResults.failedTests += suiteFailed;

            this.log(`СЮИТ "${suite.name}" завершен: ${suitePassed}✓ ${suiteFailed}✗ за ${suiteDuration}ms`, 'info');
          }
        } else {
          this.log(`Предупреждение: тестовый сюит "${suite.name}" не имеет метода runAllTests`, 'warning');
        }

      } catch (error) {
        this.log(`Критическая ошибка в сюите "${suite.name}": ${error.message || error}`, 'error');
        this.overallResults.failedTests++;
      }

      this.overallResults.totalSuites++;
    }

    this.overallResults.endTime = Date.now();
    this.overallResults.totalDuration = this.overallResults.endTime - this.overallResults.startTime;

    this.printMasterSummary();
  }

  printMasterSummary() {
    console.log('\n' + '='.repeat(80));
    this.log('=== ИТОГОВЫЕ РЕЗУЛЬТАТЫ ВСЕГО ТЕСТИРОВАНИЯ ===', 'header');
    console.log('='.repeat(80));

    console.log(`📊 Обзор:
  • Запущено сюитов: ${this.overallResults.totalSuites}
  • Всего тестов: ${this.overallResults.totalTests}
  • Успешных: ${this.overallResults.passedTests} (${this.getPercentage(this.overallResults.passedTests, this.overallResults.totalTests)}%)
  • Провальных: ${this.overallResults.failedTests} (${this.getPercentage(this.overallResults.failedTests, this.overallResults.totalTests)}%)
  • Общее время: ${this.overallResults.totalDuration}ms`);

    console.log(`\n🎯 Состояние инфраструктуры: ${this.getOverallStatus()}`);

    if (this.overallResults.failedTests > 0) {
      this.log('Найдены проблемы требующие внимания!', 'warning');
    } else {
      this.log('Инфраструктура готова к эксплуатации!', 'success');
    }

    this.printRecommendations();
  }

  getPercentage(part, total) {
    return total > 0 ? ((part / total) * 100).toFixed(1) : '0.0';
  }

  getOverallStatus() {
    const passRate = this.overallResults.passedTests / this.overallResults.totalTests;

    if (passRate >= 0.95) return '🟢 ОТЛИЧНО';
    if (passRate >= 0.8) return '🟡 ХОРОШО';
    if (passRate >= 0.6) return '🟠 ТРЕБУЕТ ВНИМАНИЯ';
    return '🔴 КРИТИЧЕСКИЕ ПРОБЛЕМЫ';
  }

  printRecommendations() {
    console.log('\n💡 Рекомендации:');
    console.log(''.padEnd(60, '='));

    if (this.overallResults.failedTests > 0) {
      console.log('🔧 Для устранения выявленных проблем:');
      console.log('   • Проверить логи ошибок выше');
      console.log('   • Убедиться в доступности внешних сервисов (sronoso.ru)');
      console.log('   • Проверить конфигурацию Supabase функций');
      console.log('   • Валидировать файлы данных (reestr.json, local_reestr.txt)');
    }

    console.log('🚀 Для запуска отдельных тестов:');
    console.log('   node test-parser.js         # Интеграционные тесты парсера');
    console.log('   node test-data-validation.js # Тесты валидации данных');
    console.log('   node test-api-endpoints.js  # Тесты API endpoints');
    console.log('   deno test --allow-net --allow-read supabase/functions/reestr-parser/test-parser.ts');
    console.log('   deno test --allow-net --allow-read supabase/functions/reestr-parser/test-supabase-function.ts');

    console.log(''.padEnd(60, '='));

    console.log('\n📈 Мониторинг и поддержка:');
    console.log('   • Регулярно запускайте полный тест-сюит');
    console.log('   • Мониторьте производительность критических путей');
    console.log('   • Проверяйте доступность внешних API');
    console.log('   • Ведите лог изменений в инфраструктуре');

    console.log('\n✨ Тестирование завершено в ' + new Date().toLocaleString('ru-RU'));
  }

  async generateReport() {
    const reportPath = path.join(__dirname, 'test-report-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');

    const report = {
      timestamp: new Date().toISOString(),
      summary: this.overallResults,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        workingDirectory: __dirname
      },
      testSuites: this.testSuites.map(suite => ({
        name: suite.name,
        resultsCount: suite.results ? suite.results.length : 0,
        passedCount: suite.results ? suite.results.filter(r => r.success).length : 0,
        failedCount: suite.results ? suite.results.filter(r => !r.success).length : 0
      }))
    };

    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      this.log(`Отчет сохранен: ${reportPath}`, 'success');
    } catch (error) {
      this.log(`Ошибка сохранения отчета: ${error.message || error}`, 'error');
    }
  }
}

// Environment setup
async function checkPrerequisites() {
  console.log('🔍 Проверка предусловий...\n');

  const checks = [
    {
      name: 'Node.js fetch support',
      check: () => typeof global.fetch === 'function'
    },
    {
      name: 'File system access',
      check: () => fs.existsSync(path.join(__dirname, 'package.json'))
    },
    {
      name: 'Public data files',
      check: () => fs.existsSync(path.join(__dirname, 'public', 'reestr.json'))
    }
  ];

  let allPassed = true;
  for (const check of checks) {
    try {
      const result = check.check();
      console.log(`${result ? '✅' : '❌'} ${check.name}`);
      if (!result) allPassed = false;
    } catch (error) {
      console.log(`❌ ${check.name}: ошибка проверки`);
      allPassed = false;
    }
  }

  console.log('');
  return allPassed;
}

// Main execution
async function main() {
  console.log('🚀 Starting Master Test Runner...');

  try {
    console.log('🔍 Checking prerequisites...');
    // Check prerequisites
    const prerequisitesOK = await checkPrerequisites();
    if (!prerequisitesOK) {
      console.log('❌ Предусловия не выполнены. Проверьте окружение.');
      process.exit(1);
    }

    console.log('✅ Prerequisites OK, initializing test runner...');

    // Initialize test runner
    const testRunner = new MasterTestRunner();

    // Register test suites
    testRunner.registerTestSuite(
      'Интеграционные тесты парсера',
      ParserIntegrationTestSuite
    );

    testRunner.registerTestSuite(
      'Валидация данных реестра',
      DataValidationTestSuite
    );

    testRunner.registerTestSuite(
      'Тестирование API endpoints',
      APIEndpointsTestSuite
    );

    testRunner.registerTestSuite(
      'Live SRO сайт',
      LiveSROTTestSuite
    );

    // Run all tests
    await testRunner.runAllSuites();

    // Generate report
    await testRunner.generateReport();

    // Exit code based on results
    process.exit(testRunner.overallResults.failedTests > 0 ? 1 : 0);

  } catch (error) {
    console.error('💥 Критическая ошибка выполнения:', error);
    process.exit(1);
  }
}

// Export for programmatic use
export { MasterTestRunner };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Необработанная ошибка:', error);
    process.exit(1);
  });
}
