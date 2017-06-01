export default (controller, handlers) => {
  controller.on('bot_space_join', handlers.handleJoin)
}
