export default class {
  constructor (controller, bot) {
    this.controller = controller
    this.bot = bot
  }

  async conductUserSurvey (personEmail, survey, recordAnswer, recordCompletion) {
    const roomForSurvey = await this.controller.api.rooms.create({
      title: survey.data.title
    })

    await this.controller.api.memberships.create({
      roomId: roomForSurvey.id,
      personEmail
    })

    this.controller.trigger('survey_started', [this.bot, {
      roomForSurvey,
      personEmail,
      survey,
      recordAnswer,
      recordCompletion: () => {
        recordCompletion()
        setTimeout(() => this.controller.api.rooms.remove(roomForSurvey), 10000)
      }
    }])
  }

  shareResults = (surveyAsJSON, renderChartForResponses) => {
    this.controller.trigger('share_results', [this.bot, {
      surveyAsJSON,
      renderChartForResponses
    }])
  }
}
