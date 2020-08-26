const net = require('net')
const fs = require('fs')
const os = require('os')

let counter = 0

class NamePipeStream {
  constructor (stream, onSocket) {
    let path
    const osType = os.type()
    if (osType === 'Windows_NT') {
      path = '\\\\.\\pipe\\stream' + (++counter)
      this.url = path
    } else {
      path = './' + (++counter) + '.sock'
      this.url = 'unix:' + path
    }

    try {
      fs.statSync(path)
      fs.unlinkSync(path)
    } catch (err) {}
    const server = net.createServer(onSocket)
    stream.on('finish', () => {
      server.close()
    })
    server.listen(path)
  }
}

function StreamInput (stream) {
  return new NamePipeStream(stream, socket => stream.pipe(socket))
}

module.exports.StreamInput = StreamInput

function StreamOutput (stream) {
  return new NamePipeStream(stream, socket => socket.pipe(stream))
}

module.exports.StreamOutput = StreamOutput
