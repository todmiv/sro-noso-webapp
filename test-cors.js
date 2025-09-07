// Test CORS preflight
console.log('Testing CORS OPTIONS...');
fetch('http://127.0.0.1:54321/functions/v1/reestr-parser', {
  method: 'OPTIONS',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => {
  console.log('OPTIONS Status:', response.status);
  console.log('OPTIONS Headers:');
  for (let [key, value] of response.headers.entries()) {
    console.log(`${key}: ${value}`);
  }
  return response.text();
})
.then(data => {
  console.log('OPTIONS Response:', data);
})
.catch(error => {
  console.log('OPTIONS Error:', error);
});
