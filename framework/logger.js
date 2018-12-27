const clc = require('cli-color')

class Logger {
  /**
   * @param {string} context tag name
   * @param {object} config {autoTag: boolean, showLine: boolean}
   */
  constructor (context, config = {autoTag: false, showLine: false}) {
    this.blue = clc.xterm(87)
    this.yellow = clc.xterm(3)
    this.purple = clc.xterm(165)
    this.orange = clc.xterm(215)
    this.context = context
    this.contextEnv = process.env.NODE_ENV
    this.config = config
    this.timeRecord = {}
  }

  static setMode (mode) {
    this.contextEnv = mode
  }

  static get () {
    return LoggerStatic
  }

  log (...message) {
    this.printMessage(message, clc.xterm(82))
  }

  /**
   * 根据传入的 config 输出信息
   * @param {object} config {autoTag: boolean, showLine: boolean, deep: number, stack: string}
   */
  _log (message, config) {
    this.printMessage(message, clc.green, config)
  }

  /**
   * * 根据传入的 config 输出信息
   * @param {object|string} e 错误信息Error或者message
   * @param {objetc} config {autoTag: boolean, showLine: boolean, deep: number, stack: string}
   */
  _error (e, config) {
    if (typeof e === 'object') {
      if (e.message) this.printMessage(e.message, clc.xterm(199), config)
      if (e.stack) this.printStackTrace(e.stack)
    } else {
      this.printMessage(e, clc.red, config)
    }
  }

  error (e, trace = '') {
    if (typeof e === 'object') {
      if (e.message) this.printMessage(e.message, clc.xterm(199))
      if (e.stack) this.printStackTrace(e.stack)
    } else {
      this.printMessage(e, clc.red)
      this.printStackTrace(trace)
    }
  }

  warn (...message) {
    this.printMessage(message, clc.yellow)
  }

  printMessage (message, color, _config = {}) {
    const config = Object.assign(this.config, _config)
    if (message instanceof Array) message = message.join(' ')
    let clz = this.context
    let line

    if (config && (config.autoTag || config.showLine)) {
      try {
        const trace = config.stack ? {stack: config.stack} : {}
        if (!trace.stack) {
          Error.captureStackTrace(trace)
        }

        let deep = 0
        if (Number.isInteger(config.deep)) deep = config.deep
        else deep = 2
        const position = trace.stack.match(/at ([\w|\S]+) \(([\w|\S]+)\)/g)[deep]
        clz = position.match(/([\w]+)/g)[1] || clz
        line = position.match(/ \(([\w|\S]+)\)/)[0]
      } catch (e) {}
    }

    process.stdout.write(this.orange(`[pid] ${process.pid}`) + ' - ')
    process.stdout.write(this.blue(`${new Date(Date.now()).toLocaleString()} `))
    process.stdout.write('[ ' + this.yellow(`${clz}`) + ' ] ')
    process.stdout.write(color(message))

    this.printTimestamp(_config.timestamp)

    if (line && config.showLine) {
      process.stdout.write(`${line}`)
    }

    process.stdout.write(`\n`)
  }

  time (info) {
    this.timeRecord[info] = Date.now()
  }

  timeEnd (info) {
    this.printMessage(`${info}`, clc.xterm(82), {timestamp: Date.now() - this.timeRecord[info]})
  }

  printTimestamp (timestamp) {
    if (timestamp) {
      process.stdout.write(this.purple(` +${timestamp}ms`))
    }
  }

  printStackTrace (trace) {
    if (!trace) return

    process.stdout.write(trace)
    process.stdout.write(`\n`)
  }
}

const LoggerStatic = new Logger('Global', {autoTag: true})

module.exports = Logger
