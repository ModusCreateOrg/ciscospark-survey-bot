export default class {
  constructor (controller, bot) {
    this.controller = controller
    this.bot = bot
  }

  async conductUserSurvey (personEmail, survey, surveyorName, recordAnswer, recordCompletion) {
    const roomForSurvey = await this.controller.api.rooms.create({
      title: survey.data.title
    })

    await this.controller.api.memberships.create({
      roomId: roomForSurvey.id,
      personEmail
    })

    this.controller.trigger('conduct_survey', [this.bot, {
      roomForSurvey,
      personEmail,
      survey,
      surveyorName,
      recordAnswer,
      recordCompletion: () => {
        recordCompletion()
        setTimeout(() => this.controller.api.rooms.remove(roomForSurvey), 10000)
      }
    }])

    return roomForSurvey
  }

  async closeSurveyRoom (roomId) {
    if (roomId) {
      await this.controller.api.rooms.remove(roomId).catch(e =>
        console.log('Error removing room, which is probably ok', e)
      )
    }
  }
}
