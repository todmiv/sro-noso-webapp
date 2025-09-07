const puppeteer = require('puppeteer');

async function scrapeData(inn) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const data = {};

  // Go to page 1 and apply filter by INN
  await page.goto(`https://www.sronoso.ru/reestr/`, { waitUntil: 'networkidle2' });
  await page.evaluate(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  // Fill filter
  await page.type('[name="arrFilter_pf[INNNumber]"]', inn);
  await page.click('[name="set_filter"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // Get table rows from the first table
  const rows = await page.$$eval('table tbody tr', processRows);

  function processRows(trs) {
    return trs.map(tr => {
      const tds = tr.querySelectorAll('td');
      if (tds.length >= 4) {
        return {
          status: tds[0].textContent.trim(),
          org_name: tds[1].textContent.trim(),
          inn: tds[2].textContent.trim(),
          registration_date: tds[3].textContent.trim()
        };
      }
      return null;
    }).filter(row => row && row.inn);
  }

  console.log(`Найдено строк: ${rows.length}`);
  if (rows.length > 0) {
    console.log(`Пример строки: ${JSON.stringify(rows[0])}`);
  }

  rows.forEach(row => {
    if (row.inn) {
      data[row.inn] = {
        status: row.status,
        org_name: row.org_name,
        registration_date: row.registration_date
      };
    }
  });

  await browser.close();
  return data;
}

async function getDataByINN(inn) {
  const data = await scrapeData(inn);
  if (data[inn]) {
    return { [inn]: data[inn] };
  }
  return null;
}

// Usage: node scraper.js <INN>
const args = process.argv.slice(2);
if (args.length > 0) {
  const inn = args[0];
  getDataByINN(inn).then(result => {
    if (result) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('ИНН не найден');
    }
  });
} else {
  console.log('Укажите ИНН как аргумент: node scraper.js <INN>');
}
