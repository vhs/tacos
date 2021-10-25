const LogEntry = function (args) {
  return {
    ...{
      ts: Date.now(),
      level: 'notice',
      instance: '',
      data: {},
      message: 'empty message'
    },
    ...args
  }
}

module.exports = { LogEntry }
