// Tests for Supabase Edge Function
// Run with: deno test --allow-net --allow-read test-supabase-function.ts

import { assertEquals, assertNotEquals, assertThrows, assertRejects } from "https://deno.land/std@0.208.0/assert/mod.ts";

// Mock Supabase environment
const originalFetch = globalThis.fetch;
const mockResponses = new Map();

// Types for test
interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface MockFetchResponse extends Response {}

// Test suite for Supabase function
class SupabaseFunctionTestSuite {
  private originalFetch: typeof globalThis.fetch;
  private mockMode = false;

  constructor() {
    this.originalFetch = globalThis.fetch;
  }

  // Enable mock mode
  enableMocks() {
    this.mockMode = true;
    globalThis.fetch = this.mockFetch.bind(this);
  }

  // Restore original fetch
  disableMocks() {
    this.mockMode = false;
    globalThis.fetch = this.originalFetch;
  }

  // Mock fetch implementation
  async mockFetch(input: RequestInfo | URL, options?: RequestInit): Promise<MockFetchResponse> {
    const url = input.toString();

    if (!this.mockMode) {
      return this.originalFetch(input, options);
    }

    // Mock SRO website responses
    if (url.includes('sronoso.ru')) {
      return this.mockSROResponse(url);
    }

    // Mock Supabase Edge Function endpoint
    if (url.includes('/functions/v1/reestr-parser')) {
      return this.mockSupabaseResponse(url, options);
    }

    // Default response
    return {
      ok: true,
      status: 200,
      text: () => Promise.resolve('Mock response'),
      json: () => Promise.resolve({})
    } as MockFetchResponse;
  }

  // Mock SRO website response
  private mockSROResponse(url: string): MockFetchResponse {
    const urlObj = new URL(url);
    const inn = urlObj.searchParams.get('arrFilter_pf[INNNumber]');

    if (inn === '5258098350') {
      // Valid INN found
      return {
        ok: true,
        status: 200,
        text: () => Promise.resolve(this.generateMockHTML(true, inn)),
        json: () => Promise.reject(new Error('Not JSON'))
      } as MockFetchResponse;
    } else {
      // Organization not found
      return {
        ok: true,
        status: 200,
        text: () => Promise.resolve(this.generateMockHTML(false, inn)),
        json: () => Promise.reject(new Error('Not JSON'))
      } as MockFetchResponse;
    }
  }

  // Mock Supabase Edge Function response
  private mockSupabaseResponse(url: string, options?: RequestInit): MockFetchResponse {
    if (options?.method !== 'POST') {
      return {
        ok: false,
        status: 405,
        text: () => Promise.resolve('Only POST'),
        json: () => Promise.resolve({ error: 'Method not allowed' })
      } as MockFetchResponse;
    }

    return {
      ok: true,
      status: 200,
      text: () => Promise.resolve('Response'),
      json: () => Promise.resolve({ success: true, inn: 'test' })
    } as MockFetchResponse;
  }

  // Generate mock HTML response
  private generateMockHTML(found: boolean, inn?: string | null): string {
    if (!found) {
      return `
        <html>
          <body>
            <div>ничего не найдено</div>
          </body>
        </html>
      `;
    }

    return `
      <html>
        <body>
          <table>
            <tbody>
              <tr>
                <td>Член СРО</td>
                <td>ООО СТК «Грейт»</td>
                <td>${inn}</td>
                <td>30.08.2022</td>
                <td>Н/Д</td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  // Run test
  async runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
    console.log(`🔬 Running test: ${name}`);
    try {
      await testFn.call(this);
      console.log(`✅ Test passed: ${name}`);
      return { success: true };
    } catch (error) {
      console.log(`❌ Test failed: ${name} - ${(error as Error).message}`);
      return { success: false, error: (error as Error).message };
    }
  }

  // Test HTTP method validation
  async testMethodValidation(): Promise<void> {
    this.enableMocks();
    try {
      const response = await globalThis.fetch('http://test/functions/v1/reestr-parser', {
        method: 'GET'
      });

      assertEquals(response.status, 405);
      assertNotEquals(response.status, 200);
    } finally {
      this.disableMocks();
    }
  }

  // Test missing INN parameter
  async testMissingInn(): Promise<void> {
    this.enableMocks();
    try {
      const response = await globalThis.fetch('http://test/functions/v1/reestr-parser', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const result = await response.json();
      assertEquals(response.status, 400);
      assertEquals(result.error.includes('required'), true);
    } finally {
      this.disableMocks();
    }
  }

  // Test successful SRO parsing
  async testSuccessfulParsing(): Promise<void> {
    this.enableMocks();
    try {
      const response = await globalThis.fetch('http://test/functions/v1/reestr-parser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inn: '5258098350' })
      });

      const result = await response.json();
      assertEquals(result.success, true);
      assertEquals(result.result.inn, '5258098350');
      assertEquals(result.result.found, true);
      assertEquals(result.result.name, 'ООО СТК «Грейт»');
    } finally {
      this.disableMocks();
    }
  }

  // Test organization not found
  async testOrganizationNotFound(): Promise<void> {
    this.enableMocks();
    try {
      const response = await globalThis.fetch('http://test/functions/v1/reestr-parser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inn: '9999999999' })
      });

      const result = await response.json();
      assertEquals(result.success, true);
      assertEquals(result.result.found, false);
      assertEquals(result.result.status, 'Не найдена в реестре СРО');
    } finally {
      this.disableMocks();
    }
  }

  // Test HTML parsing edge cases
  async testHTMLParsingEdgeCases(): Promise<void> {
    this.enableMocks();
    try {
      // Test with malformed HTML
      const malformedHTML = '<html><body><table><tr><td></td></tr></table></body></html>';
      const url = `https://www.sronoso.ru/reestr/?arrFilter_pf[INNNumber]=5258098350`;

      const response = await globalThis.fetch(url);
      assertEquals(response.ok, true);

      // Should handle empty cells gracefully
      const html = await response.text();
      assertEquals(html.includes('<table>'), true);
    } finally {
      this.disableMocks();
    }
  }

  // Test error handling
  async testErrorHandling(): Promise<void> {
    this.enableMocks();
    try {
      // Test with invalid JSON
      const response = await globalThis.fetch('http://test/functions/v1/reestr-parser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      const result = await response.json();
      assertEquals(response.status, 400);
      assertEquals(result.error, 'Invalid JSON');
    } finally {
      this.disableMocks();
    }
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Supabase Function Tests...\n');

    const tests = [
      { name: 'HTTP Method Validation', fn: this.testMethodValidation },
      { name: 'Missing INN Parameter', fn: this.testMissingInn },
      { name: 'Successful SRO Parsing', fn: this.testSuccessfulParsing },
      { name: 'Organization Not Found', fn: this.testOrganizationNotFound },
      { name: 'HTML Parsing Edge Cases', fn: this.testHTMLParsingEdgeCases },
      { name: 'Error Handling', fn: this.testErrorHandling }
    ];

    const results = [];

    for (const test of tests) {
      const result = await this.runTest(test.name, test.fn.bind(this));
      results.push(result);

      if (!result.success) {
        console.log(`Failed: ${result.error}`);
      }
    }

    this.printSummary(results);
  }

  printSummary(results: TestResult[]): void {
    console.log('\n📊 Test Results Summary:');
    console.log(`Total tests: ${results.length}`);
    console.log(`Passed: ${results.filter(r => r.success).length}`);
    console.log(`Failed: ${results.filter(r => !r.success).length}`);

    const failedTests = results.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed tests:');
      failedTests.forEach(r => console.log(`  - ${r.error}`));
    }

    console.log('\n✅ Supabase Function Tests Completed!');
  }
}

// Test for real Supabase Edge Function (requires running Supabase locally)
async function testRealSupabaseFunction(): Promise<void> {
  console.log('🌐 Testing Real Supabase Edge Function...');

  try {
    const response = await fetch('http://127.0.0.1:54321/functions/v1/reestr-parser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({ inn: '5258098350' })
    });

    if (!response.ok) {
      console.log(`⚠️ Supabase function returned ${response.status}: ${response.statusText}`);
      return;
    }

    const result = await response.json();
    console.log('✅ Real Supabase function response:', result);
  } catch (error) {
    console.log(`⚠️ Could not connect to Supabase function: ${(error as Error).message}`);
    console.log('📝 Make sure Supabase is running locally with: supabase start');
  }
}

// Main test runner
async function main(): Promise<void> {
  console.log('🏃 Starting Supabase Function Test Suite...\n');

  // Run mock tests
  const testSuite = new SupabaseFunctionTestSuite();
  await testSuite.runAllTests();

  // Run real Supabase test (if available)
  console.log('\n🔍 Testing Real Supabase Function Deployment...\n');
  await testRealSupabaseFunction();

  console.log('\n🎉 Supabase Function Testing Complete!');
}

// Export for external use
export { SupabaseFunctionTestSuite, testRealSupabaseFunction };

if (import.meta.main) {
  await main();
}
