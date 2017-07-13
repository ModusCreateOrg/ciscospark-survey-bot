const handleJoin = (bot, message) =>
  bot.reply(message, 'This trusty survey bot is here to help.')

const addTextQuestion = (convo, question, surveyId, recordAnswer) => {
  convo.addQuestion(question.text, (response, convo) => {
    recordAnswer(response)
    convo.next()
  })
}

const isValidAnswer = (question, answer) => {
  const intVal = parseInt(answer)
  return intVal > 0 && intVal <= question.choices.length
}

const addMultipleChoiceQuestion = (convo, question, surveyId, recordAnswer) => {
  const questionChoices = question.choices.map((choice, index) => `${index+1}. ${choice.text}`)
  const questionText = [question.text, ...questionChoices].join('\n')
  convo.addQuestion(questionText, (response, convo) => {
    const answer = response.text
    if (isValidAnswer(question, answer)) {
      recordAnswer(response)
    } else {
      convo.say('Please enter the number corresponding to your answer.')
      convo.repeat()
    }
    convo.next()
  })
}

const doSurvey = (bot, { roomId, personEmail, survey, recordAnswer, recordCompletion }) => {
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
      addQuestionFn(
        convo,
        question,
        survey.id,
        (response) => recordAnswer(question.id, response.text)
      )
    }

    convo.on('end', (convo) => {
      recordCompletion()
      bot.say({ user: personEmail, channel: roomId, text: 'Thanks for your responses!' })
    })
  })
}

export default {
  doSurvey,
  handleJoin
}
