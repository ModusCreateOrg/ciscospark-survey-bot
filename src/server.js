import { promisify } from 'util'
import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'

const setupWebserverCopied = (controller, port, cb) => {
  var static_dir = __dirname + '/public'
  if (controller.config && controller.config.webserver && controller.config.webserver.static_dir) {
    static_dir = controller.config.webserver.static_dir
  }

  controller.config.port = port

  controller.webserver = express()
  controller.webserver.use(bodyParser.json())
  controller.webserver.use(bodyParser.urlencoded({ extended: true }))
  controller.webserver.use(express.static(static_dir))

  controller.httpserver = http.createServer(controller.webserver)

  controller.httpserver.listen(
    controller.config.port,
    controller.config.hostname,
    function () {
      controller.log('** Starting webserver on port ' + controller.config.port)
      if (cb) { cb(null, controller.webserver) }
    }
  )

  return controller
}

const setupSparkWebserver = (controller) => new Promise((resolve, reject) => {
  setupWebserverCopied(controller, process.env.PORT || 3000, (err, webserver) =>
    err ? reject(err) : resolve(webserver)
  )
})

export default async (controller, bot) => {
  const webserver = await setupSparkWebserver(controller)
  controller.createWebhookEndpoints(webserver, bot, () => console.log('SPARK: Webhooks set up!'))
  return webserver
}

