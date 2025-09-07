// Test function for reestr-parser
import fetch from 'node-fetch'; // ES module import

async function testParser(inn) {
  try {
    console.log(`🧪 Testing with INN: ${inn}`);

    const response = await fetch('http://127.0.0.1:54321/functions/v1/reestr-parser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
      },
      body: JSON.stringify({ inn: inn })
    });

    console.log('📡 Status:', response.status);
    const data = await response.text();
    console.log('📄 Raw response:', data);

    const parsed = JSON.parse(data);
    console.log('🔍 Parsed response:', JSON.stringify(parsed, null, 2));

  } catch (error) {
    console.log('🚨 Error:', error);
  }
}

// Test with known INN
testParser('5217000301');

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testParser };
}
