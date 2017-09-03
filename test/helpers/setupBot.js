import TestBot from './TestBot'
import handlers from '../../src/handlers'
import attachHandlers from '../../src/attachHandlers'

export default t => {
  const controller = TestBot({ timeout: 5000 })
  attachHandlers(controller, handlers)
  t.context.controller = controller

  const bot = controller.spawn()
  t.context.bot = bot
}
