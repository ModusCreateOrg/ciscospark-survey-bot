import 'babel-polyfill'
import controller from './controller'
import handlers from './handlers'
import attachHandlers from './attachHandlers'
import startServer from './server'
import startWebUI from './webui'

attachHandlers(controller, handlers)

const bot = controller.spawn({})

startServer(controller, bot)
  .then(webServer => startWebUI(webServer, controller, bot))
  .catch(console.error)
