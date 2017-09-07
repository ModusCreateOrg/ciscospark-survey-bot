export default (controller, handlers) => {
  controller.on('conduct_survey', handlers.conductSurvey)
}
