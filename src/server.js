import { promisify } from 'util'

const setupSparkWebserver = (controller) => new Promise((resolve, reject) => {
  controller.setupWebserver(process.env.PORT || 3000, (err, webserver) =>
    err ? reject(err) : resolve(webserver)
  )
})

export default async (controller, bot) => {
  const webserver = await setupSparkWebserver(controller)
  controller.createWebhookEndpoints(webserver, bot, () => console.log('SPARK: Webhooks set up!'))
  return webserver
}

