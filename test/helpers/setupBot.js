import TestBot from './TestBot'

export default t => {
  const controller = TestBot({ timeout: 100 })
  t.context.controller = controller

  const bot = controller.spawn()
  // attach handlers
  t.context.bot = bot
}
