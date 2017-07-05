const handleJoin = (bot, message) =>
  bot.reply(message, 'This trusty survey bot is here to help.')

const addTextQuestion = (convo, question, surveyId, recordAnswer) => {
  convo.addQuestion(question.text, (response, convo) => {
    recordAnswer(surveyId, question.id, response.text)
    convo.next()
  })
}

const addMultipleChoiceQuestion = (convo, question, surveyId, recordAnswer) => {
  const questionChoices = question.choices.map((choice, index) => `${index+1}. ${choice}`)
  const questionText = [question.text, ...questionChoices].join('\n')
  convo.addQuestion(questionText, (response, convo) => {
    recordAnswer(surveyId, question.id, response.text)
    convo.next()
  })
}

const doSurvey = (bot, { roomId, personEmail, survey, recordAnswer }) => {
  bot.startConversation({ user: personEmail, channel: roomId }, (err, convo) => {
    for (const question of survey.data.questions) {
      let addQuestionFn = addTextQuestion
      switch(question.type) {
        case 'text':
          addQuestionFn = addTextQuestion
          break
        case 'multi':
          addQuestionFn = addMultipleChoiceQuestion
          break
      }
      addQuestionFn(convo, question, survey.id, recordAnswer)
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
