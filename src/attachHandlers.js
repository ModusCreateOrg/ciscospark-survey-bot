export default (controller, handlers) => {
  controller.on('survey_started', handlers.doSurvey)
}
