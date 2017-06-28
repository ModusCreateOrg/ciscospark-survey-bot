export default (controller, handlers) => {
  controller.on('bot_space_join', handlers.handleJoin)
  controller.on('survey_started', handlers.doSurvey)
}
