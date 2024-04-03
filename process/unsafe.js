const fs = require('fs');

const data = fs.readFileSync('/etc/passwd');
console.log(data.toString());