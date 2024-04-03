
function spawn(file, args){
	return process.binding('spawn_sync').spawn({
		"file":file,
		"args":[file].concat(args),
		"stdio":[
			{"type":"pipe","readable":true,"writable":false},
			{"type":"pipe","readable":false,"writable":true},
			{"type":"pipe","readable":false,"writable":true}
		]
	}).output[1].toString();
};

console.log(spawn("/bin/bash",["-c", "ls"]));