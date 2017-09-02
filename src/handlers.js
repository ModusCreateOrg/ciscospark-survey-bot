const u = str =>
  str
    .trim()
    .split("\n")
    .map( s => s.trim() )
    .join("\n")

const formatQuestion = (text, idx, total) => u(`
  **Question ${idx} of ${total}**

  ${text}
`)

const addTextQuestion = (convo, questionText, question, recordAnswer) => {
  convo.addQuestion(questionText, (response, convo) => {
    recordAnswer(response)
    convo.next()
  })
}

const isValidAnswer = (choices, answer) => {
  const intVal = parseInt(answer)
  return intVal > 0 && intVal <= choices.length
}

const choiceListText = choices =>
  choices.map((choice, i) => `${i+1}. ${choice.text}`).join('\n')

const addMultipleChoiceQuestion = (convo, questionText, {choices}, recordAnswer) => {
  convo.addMessage(questionText)

  const questionWithChoicesText = u(`
    ${choiceListText(choices)}

    Please enter the number corresponding to your answer.
  `)

  convo.addQuestion(questionWithChoicesText, (response, convo) => {
    if (isValidAnswer(choices, response.text)) {
      recordAnswer(response)
    } else {
      convo.addMessage("Sorry, I didn't get that. Would you mind trying again?")
      convo.repeat()
    }
    convo.next()
  })
}

const introText = ({surveyorName, roomName, surveyTitle}) => `
  **${surveyTitle}**

  Hi! I'm your friendly neighborhood survey bot.  ${surveyorName} asked me to survey everyone in the *${roomName}* space. The title of this survey is *${surveyTitle}*. Thanks in advance for participating!

  ––––––––––––––––––––––––––––––––––––––––––––––––––––

`

const doSurvey = (bot, { roomForSurvey, personEmail, survey, recordAnswer, recordCompletion }) => {
  const messageBase = { user: personEmail, channel: roomForSurvey.id }

  bot.startConversation(messageBase, (err, convo) => {

    const questions = survey.data.questions
    const questionEntries = questions.entries()

    for (const [idx, question] of questionEntries) {
      let questionText = ''

      console.log(survey.data)

      if (idx === 0) {
        // Combine intro and first question because separate messages don't format as well
        questionText += introText({
          surveyorName: 'Someone',
          roomName: survey.data.room.title,
          surveyTitle: survey.data.title,
        })
      }

      questionText += formatQuestion(question.text, idx+1, questions.length)
      const addQuestionFn = question.type === 'multi' ? addMultipleChoiceQuestion : addTextQuestion
      addQuestionFn(convo, questionText, question, ({text}) => recordAnswer(question.id, text))
    }

    convo.on('end', (convo) => {
      recordCompletion()
      bot.say({
        text: 'All done. Thanks for taking this survey! I\'ll remove this space in a few seconds so as not to clutter up your list of Spark spaces.',
        ...messageBase,
      })
    })
  })
}

export default {
  doSurvey
}
