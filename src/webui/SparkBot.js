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

  async postMessages (messages, roomId) {
    for (const message of messages) {
      await this.controller.api.messages.create({ roomId, ...message })
    }
  }

  shareResults (surveyAsJSON, renderChartForResponses, roomId) {
    this.controller.trigger('share_results', [{
      surveyAsJSON,
      renderChartForResponses,
      postMessages: messages => this.postMessages(messages, roomId)
    }])
  }
}
