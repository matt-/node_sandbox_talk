const child_process = require("node:child_process");
console.log(child_process.execSync("ls -la").toString());