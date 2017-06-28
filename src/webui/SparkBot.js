export default class {
  constructor (controller, bot) {
    this.controller = controller
    this.bot = bot
  }

  conductUserSurvey = async (personId, survey) => {
    const room = await this.controller.api.rooms.create({
      title: survey.data.title
    })
    await this.controller.api.memberships.create({
      roomId: room.id,
      personId
    })

    this.controller.trigger('survey_started', [this.bot, {
      survey,
      recordAnswer: (surveyId, questionId, answer) => {

      }
    }])
  }
}
