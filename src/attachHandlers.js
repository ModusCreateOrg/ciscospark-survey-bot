const asyncHandler = fn => (...args) => fn(...args).catch(console.error)

export default (controller, handlers) => {
  controller.on('survey_started', handlers.doSurvey)
  controller.on('share_results', asyncHandler(handlers.shareResults))
}
