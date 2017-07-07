export default class {
  constructor ({ timeout = Infinity }) {
    this.timeout = timeout
    this.queue = []
    this.waitingForData = []
  }

  enqueue = message => {
    this.queue.push(message)

    if (this.waitingForData.length) {
      const resolve = this.waitingForData.shift()
      resolve(this.queue.shift())
    }
  }

  dequeue = () => new Promise((resolve, reject) => {
    if (this.queue.length) {
      resolve(this.queue.shift())
    } else {
      this.waitingForData.push(resolve)

      if (this.timeout < Infinity) {
        const err = new Error('No message received within timeout limit')
        setTimeout(() => reject(err), this.timeout)
      }
    }
  })
}
