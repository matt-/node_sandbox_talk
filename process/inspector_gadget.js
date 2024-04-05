const { Session } = require('node:inspector/promises');

const session = new Session();
session.connect();

(async ()=>{
	await session.post('Debugger.enable');
	await session.post('Runtime.enable');

	global.Worker = require('node:worker_threads').Worker;
	
	let {result:{ objectId }} = await session.post('Runtime.evaluate', { expression: 'Worker' });
	let { internalProperties } = await session.post("Runtime.getProperties", { objectId: objectId });
	let {value:{value:{ scriptId }}} = internalProperties.filter(prop => prop.name == '[[FunctionLocation]]')[0];
	let { scriptSource } = await session.post("Debugger.getScriptSource", { scriptId });

	// find the line number where WorkerImpl is called. 
	const lineNumber = scriptSource.substring(0, scriptSource.indexOf("new WorkerImpl")).split('\n').length;

	// We can inject the local var "isInternal = true" with a conditional breakpoint.
	await session.post("Debugger.setBreakpointByUrl", {
		lineNumber: lineNumber,
		url: "node:internal/worker",
		columnNumber: 0,
		condition: "((isInternal = true),false)"
	});

	new Worker(`
		const child_process = require("node:child_process");
		console.log(child_process.execSync("ls -l").toString());
	`, {
		eval: true,
		execArgv: [
			"--experimental-permission",
			"--allow-fs-read=*",
			"--allow-fs-write=*",
			"--allow-child-process",
			"--no-warnings"
		]
	});
})()