export default (controller, handlers) => {
  controller.on('survey_started', handlers.doSurvey)
  controller.on('share_results', handlers.shareResults)
}
