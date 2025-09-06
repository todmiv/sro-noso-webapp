// Data Validation Tests for Reestr Files
// Run with: node test-data-validation.js

import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DataValidationTestSuite {
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
        this.log(`Загружен TXT реестр: ${this.localReestrData.length} символов`);
      }
    } catch (error) {
      this.log(`Ошибка загрузки тестовых данных: ${error.message || error}`, 'error');
    }
  }

  // Test JSON structure
  testJSONStructure() {
    if (!this.reestrData) throw new Error('JSON реестр не загружен');

    // Check if data is an object
    if (typeof this.reestrData !== 'object' || Array.isArray(this.reestrData)) {
      throw new Error('JSON реестр должен быть объектом');
    }

    const inns = Object.keys(this.reestrData);

    // Test sample records
    for (let i = 0; i < Math.min(10, inns.length); i++) {
      const inn = inns[i];
      const record = this.reestrData[inn];

      // INN validation (length between 9 and 15 digits)
      if (!/^\d{9,15}$/.test(inn)) {
        throw new Error(`Неверный формат ИНН: ${inn}`);
      }

      // Record structure validation
      if (typeof record !== 'object') {
        throw new Error(`Запись должна быть объектом для ИНН: ${inn}`);
      }

      if (!record.status) {
        throw new Error(`Отсутствует поле status для ИНН: ${inn}`);
      }

      if (!record.org_name) {
        throw new Error(`Отсутствует поле org_name для ИНН: ${inn}`);
      }

      if (!record.registration_date) {
        throw new Error(`Отсутствует поле registration_date для ИНН: ${inn}`);
      }

      // Status validation
      if (record.status !== 'Член СРО' && record.status !== 'Исключен') {
        throw new Error(`Неверный статус для ИНН ${inn}: ${record.status}`);
      }

      // Date validation
      if (!this.isValidDateFormat(record.registration_date)) {
        throw new Error(`Неверный формат даты для ИНН ${inn}: ${record.registration_date}`);
      }
    }

    this.log(`✓ Валидно проверено ${Math.min(10, inns.length)} записей JSON`);
  }

  // Validate date format
  isValidDateFormat(dateStr) {
    // Russian date format: dd.mm.yyyy
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(dateStr)) {
      return false;
    }

    const [day, month, year] = dateStr.split('.').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
  }

  // Test data completeness
  testDataCompleteness() {
    if (!this.reestrData) throw new Error('JSON реестр не загружен');

    const inns = Object.keys(this.reestrData);
    let completeRecords = 0;
    let incompleteRecords = 0;

    inns.forEach(inn => {
      const record = this.reestrData[inn];

      if (record.status && record.org_name && record.registration_date) {
        completeRecords++;
      } else {
        incompleteRecords++;
        this.log(`Неполная запись для ИНН: ${inn}`, 'warning');
      }
    });

    this.log(`✓ Полные записи: ${completeRecords}, Неполные: ${incompleteRecords}`);

    if (incompleteRecords > 0) {
      throw new Error(`Найдено ${incompleteRecords} неполных записей`);
    }
  }

  // Test INN uniqueness
  testINNUniqueness() {
    if (!this.reestrData) throw new Error('JSON реестр не загружен');

    const inns = Object.keys(this.reestrData);
    const uniqueINNs = new Set(inns);

    if (inns.length !== uniqueINNs.size) {
      throw new Error('Обнаружены дублирующиеся ИНН');
    }

    this.log(`✓ Все ${inns.length} ИНН уникальны`);
  }

  // Test organization name format
  testOrganizationNameFormat() {
    if (!this.reestrData) throw new Error('JSON реестр не загружен');

    const inns = Object.keys(this.reestrData);

    inns.forEach(inn => {
      const record = this.reestrData[inn];
      const name = record.org_name;

      // Check for empty names
      if (!name || name.trim().length === 0) {
        throw new Error(`Пустое название организации для ИНН: ${inn}`);
      }

      // Check for reasonable length
      if (name.length < 3) {
        throw new Error(`Слишком короткое название организации для ИНН ${inn}: "${name}"`);
      }

      if (name.length > 200) {
        throw new Error(`Слишком длинное название организации для ИНН ${inn}: ${name.length} символов`);
      }
    });

    this.log(`✓ Проверены названия ${inns.length} организаций`);
  }

  // Test TXT file format
  testTXTFileFormat() {
    if (!this.localReestrData) {
      this.log('TXT файл не найден, тест пропущен', 'warning');
      return;
    }

    // Basic checks
    if (this.localReestrData.length === 0) {
      throw new Error('TXT файл пустой');
    }

    // Check for basic structure (should contain some readable content)
    const lines = this.localReestrData.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);

    if (nonEmptyLines.length === 0) {
      throw new Error('TXT файл не содержит читаемого содержимого');
    }

    this.log(`✓ TXT файл содержит ${nonEmptyLines.length} непустых строк`);
  }

  // Test data consistency between formats
  testDataConsistency() {
    if (!this.reestrData || !this.localReestrData) {
      this.log('Один или оба файла не найдены, тест консистентности пропущен', 'warning');
      return;
    }

    // Simple check - if we have data in both formats
    const jsonEntries = Object.keys(this.reestrData).length;
    const txtLines = this.localReestrData.split('\n').filter(line => line.trim().length > 0).length;

    // For consistency, TXT should have some relationship to JSON
    // This is a basic check - in reality you'd need domain-specific rules
    this.log(`JSON: ${jsonEntries} записей, TXT: ${txtLines} строк`);

    // Warn if there's significant discrepancy
    const discrepancy = Math.abs(jsonEntries - txtLines) / Math.max(jsonEntries, txtLines);
    if (discrepancy > 2) { // More than 200% difference
      this.log(`Предупреждение: большое расхождение в объеме данных (${(discrepancy * 100).toFixed(1)}%)`, 'warning');
    } else {
      this.log(`✓ Данные в различных форматах имеют сопоставимый объем`);
    }
  }

  // Test file encoding
  testFileEncoding() {
    if (!this.reestrData) throw new Error('JSON реестр не загружен');

    // Try to detect encoding issues
    const sampleINN = Object.keys(this.reestrData)[0];
    const sampleName = this.reestrData[sampleINN].org_name;

    // Check for encoding issues (question marks, broken characters)
    if (sampleName.includes('') || sampleName.includes('?')) {
      throw new Error(`Обнаружена проблема кодировки в названии организации: ${sampleName}`);
    }

    // Check for valid Cyrillic characters
    const cyrillicRegex = /[а-яё]/i;
    if (!cyrillicRegex.test(sampleName)) {
      this.log(`Предупреждение: название организации не содержит кириллицы: ${sampleName}`, 'warning');
    }

    this.log('✓ Кодировка файлов проверена');
  }

  // Performance test
  async testDataLoadingPerformance() {
    const start = Date.now();

    if (!this.reestrData) throw new Error('JSON реестр не загружен');

    // Simulate loading time
    const inns = Object.keys(this.reestrData);
    let processed = 0;

    for (const inn of inns) {
      const record = this.reestrData[inn];
      // Basic validation
      if (record && record.org_name && record.status) {
        processed++;
      }
    }

    const duration = Date.now() - start;
    this.log(`✓ Обработано ${processed} записей за ${duration}ms`);

    // Performance threshold
    if (duration > 1000) { // More than 1 second
      this.log(`Предупреждение: обработка данных занимает долгое время (${duration}ms)`, 'warning');
    }
  }

  async runAllTests() {
    console.log('🚀 Запуск тестов валидации данных...\n');
    await this.loadTestData();

    const tests = [
      { name: 'JSON структура данных', fn: this.testJSONStructure },
      { name: 'Полнота данных', fn: this.testDataCompleteness },
      { name: 'Уникальность ИНН', fn: this.testINNUniqueness },
      { name: 'Формат названий организаций', fn: this.testOrganizationNameFormat },
      { name: 'Формат TXT файла', fn: this.testTXTFileFormat },
      { name: 'Консистентность данных', fn: this.testDataConsistency },
      { name: 'Кодировка файлов', fn: this.testFileEncoding },
      { name: 'Производительность загрузки', fn: this.testDataLoadingPerformance }
    ];

    for (const test of tests) {
      try {
        await this.runTest(test.name, test.fn.bind(this));
      } catch (error) {
        // Continue with other tests even if one fails
        console.log(`🥵 Тест "${test.name}" прерван: ${error.message || error}`);
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Результаты тестирования:');
    console.log(`Всего тестов: ${this.results.length}`);
    console.log(`Успешно: ${this.results.filter(r => r.success).length}`);
    console.log(`Провалено: ${this.results.filter(r => !r.success).length}`);

    console.log('\n📈 Детали тестов:');
    this.results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${index + 1}. ${result.name} - ${result.duration}ms`);
      if (!result.success && result.error) {
        console.log(`   Ошибка: ${result.error}`);
      }
    });

    const failed = this.results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log('\n❌ Провальные тесты:');
      failed.forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }

    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    console.log(`\n⏱️ Общее время выполнения: ${totalDuration}ms`);

    if (this.results.filter(r => !r.success).length === 0) {
      console.log('\n🎉 Все тесты прошли успешно! ✅');
    } else {
      console.log('\n❌ Некоторые тесты провалились - требуется внимание.');
    }
  }
}

// Main test runner
async function main() {
  console.log('📂 Запуск тестов валидации данных...\n');

  const testSuite = new DataValidationTestSuite();
  await testSuite.runAllTests();

  console.log('\n✨ Тестирование данных завершено!');
}

// Export for external use
export { DataValidationTestSuite };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Ошибка запуска тестов:', error);
    process.exit(1);
  });
}
