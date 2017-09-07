const asyncHandler = fn => (...args) => fn(...args).catch(console.error)

export default (controller, handlers) => {
  controller.on('survey_started', handlers.doSurvey) // TODO: should this be async, too?
  controller.on('share_results', asyncHandler(handlers.shareResults))
}
