import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Простой тест - проверка файлов
function testFiles() {
  console.log('🚀 Запуск простого теста...\n');

  const reestrPath = join(__dirname, 'public', 'reestr.json');
  console.log(`📁 Проверка файла: ${reestrPath}`);

  try {
    const exists = fs.existsSync(reestrPath);
    console.log(`✅ Файл ${exists ? '' : 'не '}существует`);

    const content = fs.readFileSync(reestrPath, 'utf8');
    const data = JSON.parse(content);
    console.log(`📊 Загружено ${Object.keys(data).length} записей из JSON`);

    // Показать сэмпл данных
    const firstINN = Object.keys(data)[0];
    console.log(`🌟 Первый ИНН: ${firstINN}`);
    console.log(`🏢 Организация: ${data[firstINN]?.org_name}`);
    console.log(`📋 Статус: ${data[firstINN]?.status}`);

    console.log('\n🎉 Тест файлов прошел успешно!');

  } catch (error) {
    console.error('❌ Ошибка теста:', error.message);
  }
}

// Запуск
testFiles();
