// node --experimental-policy=policy.json --experimental-websocket inspect.js

// node --experimental-policy=policy.json --experimental-websocket inspect.js

(async () => {
  // Debug process
  process._debugProcess(process.pid);

  // Fetch data and extract WebSocket URL
  const data = await fetch('http://127.0.0.1:9229/json')
  .then((resp) => resp.json());
  const wsURL = data[0].webSocketDebuggerUrl;

  // Create and connect to Chrome Debugger
  const chromDebugger = new SimpleChromDebugger();
  await chromDebugger.connect(wsURL);

  chromDebugger.addEventListener('Debugger.scriptParsed', async (e) => {
    const { url, scriptId } = e.detail;
    if (url == 'node:internal/policy/manifest') {
      let { scriptSource } = await chromDebugger.send('Debugger.getScriptSource',{scriptId})
      const lineNumber = scriptSource.split('\n').findIndex((line) => line.includes('if (result === kFallThrough)'));

      await chromDebugger.send('Debugger.setBreakpointByUrl', {
          url,
          lineNumber: lineNumber - 1,
          columnNumber: 0,
          condition: '((result = kFallThrough),false)',
        });
    }
  })

  await chromDebugger.send('Debugger.enable')

  setTimeout(() => {
      console.log(require('child_process'))
  }, 1000)

})()



class SimpleChromDebugger extends EventTarget {
  constructor() {
    super();
    this.id = 1;
    this.methodMap = new Map();
    this.socket = undefined;
  }

  async connect(url) {
    this.socket = new WebSocket(url);

    return new Promise((resolve, reject) => {
      this.socket.addEventListener('open', () => resolve(this));
      this.socket.addEventListener('error', reject);
      this.socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        this.dispatchEvent(new CustomEvent('message', { detail: data }));
        if (data.method) {
          this.dispatchEvent(new CustomEvent(data.method, { detail: data.params }));
        }
        if (data.id && this.methodMap.has(data.id)) {
          const { resolve, reject } = this.methodMap.get(data.id);
          if (data.result) {
            resolve(data.result);
          } else if (data.error) {
            reject(data.error);
          }
          this.methodMap.delete(data.id);
        }
      });
    });
  }

  async send(method, params) {
    const messageId = this.id++;
    this.methodMap.set(messageId, { resolve: null, reject: null });
    this.socket.send(JSON.stringify({ id: messageId, method, params }));

    return new Promise((resolve, reject) => {
      this.methodMap.set(messageId, { resolve, reject });
    });
  }
}