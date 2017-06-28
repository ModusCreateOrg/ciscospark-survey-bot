const handleJoin = (bot, message) =>
  bot.reply(message, 'This trusty survey bot is here to help.')

const doSurvey = (bot, { roomId, personEmail, survey, recordAnswer }) => {
  console.log('starting survey', survey)
  bot.startConversation({ user: personEmail, channel: roomId }, (err, convo) => {
    for (const question of survey.data.questions) {
      if (question.type === 'text') {
        convo.addQuestion(question.text, (response, convo) => {
          recordAnswer(survey.id, question.id, response.text)
          convo.next()
        })
      }
    }

    convo.addMessage('Thanks for your responses!')

    // convo.on('end', (convo) => {
    //   //TODO: record survey completed
    // })
  })
}

export default {
  doSurvey,
  handleJoin
}
