// Debug script to check what the website returns
import fetch from 'node-fetch';

async function debugSiteRequest(inn) {
  console.log(`🔍 Debugging site request for INN: ${inn}\n`);

  // Step 1: Get initial page to get cookies
  console.log('🌐 Step 1: Getting initial page...');
  const initialResponse = await fetch('https://www.sronoso.ru/reestr/', {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3'
    }
  });

  console.log(`🥠 Initial page status: ${initialResponse.status}`);
  const cookies = initialResponse.headers.get('set-cookie');

  // Step 2: Make search request with parameters
  console.log('\n🌐 Step 2: Making search request...');
  const searchParams = new URLSearchParams({
    'arrFilter_ff[NAME]': '',
    'arrFilter_pf[INNNumber]': inn,
    'set_filter': 'Показать'
  });

  const searchUrl = `https://www.sronoso.ru/reestr/?${searchParams.toString()}`;
  console.log(`🔗 URL: ${searchUrl}`);

  const searchResponse = await fetch(searchUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
      'Cookie': cookies
    }
  });

  console.log(`🔍 Search response status: ${searchResponse.status}`);

  // Get and analyze HTML
  const html = await searchResponse.text();
  console.log(`📄 HTML length: ${html.length}`);

  console.log('\n🔍 Content analysis:');
  console.log(`📋 Contains "АО": ${html.includes('АО «КМ')}`);
  console.log(`📋 Contains "5217000301": ${html.includes(inn)}`);
  console.log(`📋 Contains table: ${html.includes('<table')}`);
  console.log(`📋 Contains "ничего не найдено": ${html.includes('ничего не найдено')}`);
  console.log(`📋 Contains "не найден": ${html.includes('не найден')}`);

  // Show first 500 characters
  console.log('\n📄 HTML beginning:');
  console.log(html.substring(0, 500) + '...');

  // Look for tables
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  if (tableMatch) {
    console.log(`\n📊 Found ${tableMatch.length} table(s)`);

    for (let i = 0; i < tableMatch.length; i++) {
      const table = tableMatch[i];
      console.log(`\n============ TABLE ${i + 1} ============`);
      console.log(`🏗️ Table length: ${table.length}`);

      // Look for rows in this table
      const rowMatch = table.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      if (rowMatch) {
        console.log(`📋 Found ${rowMatch.length} row(s) in table ${i + 1}`);

        // Show all rows for tables with few rows, first few for large tables
        const maxRows = rowMatch.length <= 10 ? rowMatch.length : 5;
        for (let j = 0; j < maxRows; j++) {
          console.log(`📋 Table ${i + 1}, Row ${j + 1}: ${rowMatch[j].substring(0, 300)}...`);
        }
        if (rowMatch.length > 10) {
          console.log(`📋 ... and ${rowMatch.length - 5} more rows not shown`);
        }
      } else {
        console.log(`❌ No rows found in table ${i + 1}`);
      }
    }
  }

  return html;
}

// Test with known INN
debugSiteRequest('5217000301')
  .then(html => {
    console.log('\n✅ Debug complete');
  })
  .catch(error => {
    console.error('❌ Debug error:', error);
  });
