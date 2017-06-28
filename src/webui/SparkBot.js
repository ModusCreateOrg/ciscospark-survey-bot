export default class {
  constructor (controller, bot) {
    this.controller = controller
    this.bot = bot
  }

  conductUserSurvey = async (personEmail, survey) => {
    const room = await this.controller.api.rooms.create({
      title: survey.data.title
    })
    await this.controller.api.memberships.create({
      roomId: room.id,
      personEmail
    })

    this.controller.trigger('survey_started', [this.bot, {
      roomId: room.id,
      personEmail,
      survey,
      recordAnswer: (surveyId, questionId, answer) => {
        console.log('got answer', answer, 'for question', questionId, 'of survey', surveyId)
      }
    }])
  }
}
