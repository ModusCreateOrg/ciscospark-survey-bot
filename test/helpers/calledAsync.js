export default (stub, timeout = 1000, interval = 10) =>
  new Promise((resolve, reject) => {
    let timedOut = false

    setTimeout(() => {
      timedOut = true
      reject(new Error('Stub not called in time'))
    }, timeout)

    const poll = () => {
      if (timedOut) return
      stub.calledOnce ? resolve() : setTimeout(poll, interval)
    }
    poll()
  })

