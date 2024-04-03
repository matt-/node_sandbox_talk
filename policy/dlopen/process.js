const mod = {exports:{}};
process.dlopen(mod,  "./addon.node")
const {exports: {exec}} = mod;

console.log(exec("ls"));