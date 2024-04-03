
"use strict";

// zig cc --target=wasm32-wasi -shared -Os -s -o file.wasm file.c
// cat file.wasm | openssl base64
// node --no-warnings --experimental-permission --allow-fs-read=$(pwd) index.js

const { WASI } = require("wasi");

console.log(process.permission.has('fs.read', '/etc/passwd')); // false

console.log("--------------------------------------------------")

const wasi = new WASI({
	version: 'preview1',
	preopens: { '/': '/' },
	args: ['/etc/passwd'],
});

(async () => {
	const wasm = await WebAssembly.compile(getData());
	const instance = await WebAssembly.instantiate(wasm, { wasi_snapshot_preview1: wasi.wasiImport });
	wasi.start(instance);
})();

function getData(){
	const data = ` ** CONTENT FORM BASE64 ENCODED FILE ** `;
	return  new Buffer.from(data, 'base64');
}  