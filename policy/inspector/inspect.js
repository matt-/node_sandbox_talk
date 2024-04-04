// node --experimental-policy=policy.json --experimental-websocket inspect.js

;(async () => {
    process._debugProcess(process.pid)
  
    let data = await fetch('http://127.0.0.1:9229/json').then((resp) => {
      return resp.json()
    })
    let wsURL = data[0].webSocketDebuggerUrl
  
    let chromDebugger = new SimpleChromDebugger()
    await chromDebugger.connect(wsURL)
  
    chromDebugger.addEventListener('Debugger.scriptParsed', async (e) => {
      //console.log(e.type, e.detail);
      let data = e.detail
  
      if (data.url == 'node:internal/policy/manifest') {
        let { scriptSource } = await chromDebugger.send(
          'Debugger.getScriptSource',
          {
            scriptId: data.scriptId,
          }
        )
        const lineNumber = scriptSource
          .substring(0, scriptSource.indexOf('if (result === kFallThrough)'))
          .split('\n').length
        await chromDebugger.send('Debugger.setBreakpointByUrl', {
          lineNumber: lineNumber - 1,
          url: data.url,
          columnNumber: 0,
          condition: '((result = kFallThrough),false)',
        })
      }
    })
  
    await chromDebugger.send('Debugger.enable')
  })()
  
  setTimeout(() => {
    console.log(require('child_process'))
  }, 1000)
  
  class SimpleChromDebugger extends EventTarget {
    constructor() {
      super()
      this.methodMap = new Map()
      this.socket = undefined
      this.id = 1
    }
  
    async send(method, params) {
      this.socket.send(
        JSON.stringify({
          id: this.id,
          method,
          params,
        })
      )
  
      const messagePromise = new Promise((resolve, reject) => {
        this.methodMap.set(this.id, {
          resolve,
          reject,
        })
      })
  
      this.id += 1
      return messagePromise
    }
  
    async connect(url) {
      this.socket = new WebSocket(url)
  
      return new Promise((resolve, reject) => {
        this.socket.addEventListener('open', (event) => {
          resolve(this)
        })
  
        this.socket.addEventListener('error', (event) => {
          reject(event)
        })
  
        this.socket.addEventListener('message', (event) => {
          let data = JSON.parse(event.data)
  
          this.dispatchEvent(
            new CustomEvent('message', {
              detail: data,
            })
          )
  
          if (data.method) {
            this.dispatchEvent(
              new CustomEvent(data.method, {
                detail: data.params,
              })
            )
          }
  
          if (data.id && this.methodMap.has(data.id)) {
            const p = this.methodMap.get(data.id)
            if (data.result) {
              p.resolve(data.result)
            } else if (data.error) {
              p.reject(data.error)
            }
            this.methodMap.delete(data.id)
          }
        })
      })
    }
  }