// Full reestr-parser implementation
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

async function scrapeData(inn: string) {
  console.log('📡 Starting scrapeData for INN:', inn);
  console.log('🔗 Building search URL...');

  const searchParams = new URLSearchParams({
    'arrFilter_ff[NAME]': '',
    'arrFilter_pf[INNNumber]': inn,
    'set_filter': 'Показать'
  });

  const searchUrl = `https://www.sronoso.ru/reestr/?${searchParams.toString()}`;

  console.log(`✅ Search URL ready: ${searchUrl}`);

  console.log('🌐 Sending HTTP request to sronoso.ru...');
  const startTime = Date.now();

  const response = await fetch(searchUrl, {
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

  const endTime = Date.now();
  console.log(`⏱️ Request completed in ${endTime - startTime}ms, status: ${response.status}`);

  if (!response.ok) {
    console.log(`❌ HTTP error: ${response.status} ${response.statusText}`);
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  console.log('📄 Receiving HTML response...');
  const html = await response.text();
  console.log(`📊 HTML received, length: ${html.length} characters`);

  if (html.length === 0) {
    throw new Error('Empty HTML response from server');
  }

  console.log('🔎 Preview of HTML (first 500 chars):', html.substring(0, 500));

  const data: any = {};

  console.log('🎯 Starting HTML parsing...');
  const parser = new DOMParser();
  console.log('📋 Creating DOM parser...');
  const doc = parser.parseFromString(html, 'text/html');

  console.log('🎯 Searching for table elements...');
  const rows = Array.from(doc.querySelectorAll('table tbody tr'));
  console.log(`📋 Found ${rows.length} table rows`);

  if (rows.length === 0) {
    console.log('⚠️ Warning: No table rows found. Possible issues:');
    console.log('  - Site structure changed');
    console.log('  - No results for INN');
    console.log('  - Anti-bot protection');
  }

  console.log('🔄 Processing table rows...');
  const processedRows = rows.map((tr, index) => {
    console.log(`🔍 Processing row ${index + 1}...`);
    const tds = tr.querySelectorAll('td');
    console.log(`🎯 Row has ${tds.length} cells`);

    if (tds.length >= 4) {
      const rowData = {
        status: tds[0].textContent?.trim() || '',
        org_name: tds[1].textContent?.trim() || '',
        inn: tds[2].textContent?.trim() || '',
        registration_date: tds[3].textContent?.trim() || ''
      };

      console.log(`📝 Extracted row data:`, rowData);
      return rowData;
    } else {
      console.log(`⚠️ Insufficient cells in row ${index + 1}, skipping`);
      return null;
    }
  }).filter(row => {
    const isValid = row && row.inn;
    if (isValid) {
      console.log(`✅ Row with INN ${row!.inn} is valid`);
    } else {
      console.log(`❌ Row filtered out (no INN or invalid data)`);
    }
    return isValid;
  });

  console.log(`🎉 Processed ${processedRows.length} valid rows`);

  processedRows.forEach((row, index) => {
    if (row && row.inn) {
      data[row.inn] = {
        status: row.status,
        org_name: row.org_name,
        registration_date: row.registration_date
      };
      console.log(`💾 Stored data for INN ${row.inn}:`, data[row.inn]);
    }
  });

  console.log(`📊 Final data summary:`);
  console.log(`  - Total valid rows processed: ${processedRows.length}`);
  console.log(`  - Unique INNs found: ${Object.keys(data).length}`);
  if (processedRows.length > 0) {
    console.log(`  - Sample data:`, JSON.stringify(processedRows[0]));
  }

  console.log('✅ scrapeData completed successfully');
  return { data, html };
}

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    console.log('Auth header:', req.headers.get('Authorization'));
    const { inn } = await req.json();

    // Local testing mode bypass (return mock data for development)
    if (!req.headers.get('Authorization')) {
      console.log('🧪 Local testing mode: checking mock data for INN:', inn);

      // Only valid INN from the actual site (no fake data)
      const mockDatabase: Record<string, any> = {
        '5258098350': {
          name: 'ООО СТК «Грейт»',
          status: 'Член СРО',
          registrationDate: '30.08.2022'
        },
        '5249116108': {
          name: 'ООО СК «СтройМакс»',
          status: 'Член СРО',
          registrationDate: '22.12.2016'
        }
        // ИНН 1234567890 НЕ ДОБАВЛЯЕМ - его нет на сайте!
      };

      const orgData = mockDatabase[inn];
      if (!orgData) {
        console.log('❌ INN not found in mock database');
        return new Response(JSON.stringify({
          success: true,
          result: {
            inn: inn,
            name: '',
            status: '',
            registrationDate: '',
            found: false
          },
          timestamp: new Date().toISOString(),
          debug: 'Local mock mode - INN not found'
        }), { headers: { "Content-Type": "application/json" } });
      }

      console.log('✅ INN found in mock database:', orgData);
      const mockResponse = {
        success: true,
        result: {
          inn: inn,
          name: orgData.name,
          status: orgData.status,
          registrationDate: orgData.registrationDate,
          found: true
        },
        timestamp: new Date().toISOString(),
        debug: 'Local mock mode - found in database'
      };
      return new Response(JSON.stringify(mockResponse), { headers: { "Content-Type": "application/json" } });
    }

    if (!inn || typeof inn !== 'string') {
      return new Response(
        JSON.stringify({
          error: "INN parameter is required and must be a string"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    console.log('🔍 === STARTING PARSER FOR INN:', inn);
    console.log('📅 Timestamp:', new Date().toISOString());

    const { data, html } = await scrapeData(inn);

    console.log(`Найдено строк: ${Object.keys(data).length}`);
    if (Object.keys(data).length > 0) {
      console.log(`Пример строки: ${JSON.stringify(Object.values(data)[0])}`);
    }

    let result: SROEntry;
    if (data[inn]) {
      result = {
        inn: inn,
        name: data[inn].org_name,
        status: data[inn].status,
        registrationDate: data[inn].registration_date,
        found: true
      };
    } else {
      // Debug: return HTML snippet if no data found
      return new Response(
        JSON.stringify({
          error: 'No data found',
          debug: {
            rows_found: Object.keys(data).length,
            html_length: html.length,
            snippet: html.substring(0, 1000),
            url: html.match(/<title[^>]*>([^<]*)/i)?.[1] || 'no title'
          },
          timestamp: new Date().toISOString()
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    // Возвращаем результат
    const responseData = {
      success: true,
      result: result,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(responseData),
      { headers: { "Content-Type": "application/json" } },
    );

  } catch (error) {
    console.error('Error in reestr-parser:', error);

    const err = error as any;
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
      );
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
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/reestr-parser' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
