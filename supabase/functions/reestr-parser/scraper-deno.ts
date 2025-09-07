import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";

export interface ScrapedResult {
  status: string;
  org_name: string;
  inn: string;
  registration_date: string;
}

/**
 * Deno-compatible scraper for SRO NOSO registry using Puppeteer logic
 * Adapted for Supabase Edge Functions environment
 */
export async function scrapeRegistryForINN(inn: string): Promise<Record<string, ScrapedResult> | null> {
  try {
    console.log('🔍 Deno scraper starting for INN:', inn);

    // Step 1: Load initial page to get cookies and session
    const initialResponse = await fetchRegistryPage();

    if (!initialResponse.ok) {
      console.log('❌ Failed to load initial page:', initialResponse.status);
      return null;
    }

    const cookies = initialResponse.headers.get('set-cookie');
    console.log('🍪 Cookies obtained:', !!cookies);

    // Step 2: Apply filter by INN using form submission
    await new Promise(resolve => setTimeout(resolve, 2000)); // Respectful delay

    const results = await submitSearchForm(cookies, inn);

    if (results && results[inn]) {
      console.log('✅ Scraped data for:', inn, '-', results[inn].org_name);
      return results;
    } else {
      console.log('❌ No results found for INN:', inn);
      return null;
    }

  } catch (error) {
    console.error('🚨 Scraper error:', error);
    return null;
  }
}

/**
 * Load the registry page to get session cookies
 */
async function fetchRegistryPage(): Promise<Response> {
  return await fetch('https://www.sronoso.ru/reestr/', {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'no-cache'
    }
  });
}

/**
 * Submit search form with INN parameter
 */
async function submitSearchForm(cookies: string | null, inn: string): Promise<Record<string, ScrapedResult> | null> {
  const formData = new URLSearchParams({
    'arrFilter_ff[NAME]': '',
    'arrFilter_pf[INNNumber]': inn,
    'set_filter': 'Показать'
  });

  console.log('🌐 Submitting search form...');

  const response = await fetch('https://www.sronoso.ru/reestr/', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.sronoso.ru',
      'Referer': 'https://www.sronoso.ru/reestr/',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'no-cache',
      ...(cookies && { 'Cookie': cookies })
    },
    body: formData.toString()
  });

  if (!response.ok) {
    console.log('❌ Search request failed:', response.status);
    return null;
  }

  // Wait a moment for server processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Parse the HTML response
  const html = await response.text();
  console.log('📄 Response HTML length:', html.length);

  return parseSearchResults(html);
}

/**
 * Parse HTML table rows to extract organization data
 */
function parseSearchResults(html: string): Record<string, ScrapedResult> | null {
  try {
    // Use Deno DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    if (!doc) {
      console.log('❌ Failed to parse HTML document');
      return null;
    }

    // Find table with results (skip filter table)
    const tables = doc.querySelectorAll('table');
    console.log('📊 Found', tables.length, 'tables on page');

    let resultsTable: Element | null = null;

    // Find table that contains results (has rows with org data)
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const tbody = table.querySelector('tbody');

      if (tbody) {
        const rows = tbody.querySelectorAll('tr');
        // Check if this table has data rows (not just form)
        for (let row of rows) {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 4) {
            // Check if first cell looks like status
            const statusCell = cells[0]?.textContent?.trim();
            if (statusCell && (statusCell.includes('Член') || statusCell.includes('СРО'))) {
              resultsTable = table;
              console.log('✅ Found results table at index:', i);
              break;
            }
          }
        }
      }

      if (resultsTable) break;
    }

    if (!resultsTable) {
      console.log('❌ No results table found');
      return null;
    }

    const results: Record<string, ScrapedResult> = {};

    // Parse table rows
    const tbody = resultsTable.querySelector('tbody');
    if (tbody) {
      const rows = tbody.querySelectorAll('tr');

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');

        if (cells.length >= 4) {
          const inn = cells[2]?.textContent?.trim();

          if (inn && inn.length >= 10) { // Valid INN format
            const result: ScrapedResult = {
              status: cells[0]?.textContent?.trim() || 'Член СРО',
              org_name: cells[1]?.textContent?.trim() || '',
              inn: inn,
              registration_date: cells[3]?.textContent?.trim() || ''
            };

            results[inn] = result;
            console.log(`📋 Extracted row ${i + 1}:`, inn, '-', result.org_name);
          }
        }
      }
    }

    console.log('✅ Parsed', Object.keys(results).length, 'organizations');
    return results;

  } catch (error) {
    console.error('🚨 HTML parsing error:', error);
    return null;
  }
}

/**
 * Helper function to extract data from table cells, handling HTML links
 */
function extractCellText(cell: Element | null): string {
  if (!cell) return '';

  // Handle cases where cell contains links
  const links = cell.querySelectorAll('a');
  if (links.length > 0) {
    // Get text from first link
    return links[0].textContent?.trim() || cell.textContent?.trim() || '';
  }

  return cell.textContent?.trim() || '';
}

/**
 * Usage example for Supabase Edge Function
 * This would be called from your main function handler
 */
export async function reestrParserHandler(inn: string) {
  console.log('🌐 Starting SRO parser for INN:', inn);

  const results = await scrapeRegistryForINN(inn);

  if (results && results[inn]) {
    const orgData = results[inn];
    return {
      success: true,
      data: {
        inn: orgData.inn,
        organization: orgData.org_name,
        status: orgData.status,
        registration_date: orgData.registration_date
      }
    };
  } else {
    return {
      success: false,
      message: 'Организация не найдена в реестре СРО НОСО'
    };
  }
}
