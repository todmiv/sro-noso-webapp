const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/reestr.json', 'utf8'));

let latestEntry = null;
let latestDate = new Date('1900-01-01');

for (const [id, entry] of Object.entries(data)) {
  const dateParts = entry.registration_date.split('.');
  const date = new Date(`${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`);
  if (date > latestDate) {
    latestDate = date;
    latestEntry = { id, ...entry };
  }
}

console.log('Самая свежая запись:', latestEntry);
