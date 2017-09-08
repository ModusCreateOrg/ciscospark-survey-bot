import u from './helpers/unindent'
import markdownQuote from './helpers/markdownQuote'

const formatQuestion = (text, idx, total) => `
  **Question ${idx} of ${total}**

  ${text}
`

const addTextQuestion = (convo, questionText, question, recordAnswer) => {
  convo.addQuestion(u(questionText), (response, convo) => {
    recordAnswer(response)
    convo.next()
  })
}

const isValidAnswer = (choices, answer) => {
  const intVal = parseInt(answer)
  return intVal > 0 && intVal <= choices.length
}

const choiceListText = choices =>
  choices.map((choice, i) => `${i + 1}. ${choice.text}`).join('\n')

const addMultipleChoiceQuestion = (convo, questionText, {choices}, recordAnswer) => {
  convo.addMessage(u(questionText))

  const questionWithChoicesText = `
    ${choiceListText(choices)}

    Please enter the number corresponding to your answer.
  `

  convo.addQuestion(u(questionWithChoicesText), (response, convo) => {
    if (isValidAnswer(choices, response.text)) {
      recordAnswer(response)
    } else {
      convo.addMessage("Sorry, I didn't get that. Would you mind trying again?")
      convo.repeat()
    }
    convo.next()
  })
}

const introText = ({surveyorName, title, description}) => {
  let text = `
    **${title}**

    Hi! I'm your friendly neighborhood survey bot.  ${surveyorName} asked me to give you this survey titled *${title}*. Thanks in advance for participating!
  `
  if (description) {
    text += `

      About this survey:

      ${markdownQuote(description || '')}

      ---

    `
  }
  return text
}

export default (bot, { roomForSurvey, personEmail, survey, recordAnswer, recordCompletion }) => {
  const messageBase = { user: personEmail, channel: roomForSurvey.id }

  bot.startConversation(messageBase, (err, convo) => {
    if (err) { console.error(err) }

    const questions = survey.data.questions
    const questionEntries = questions.entries()

    for (const [idx, question] of questionEntries) {
      let questionText = ''

      if (idx === 0) {
        // Combine intro and first question because separate messages don't format as well
        questionText += introText({
          surveyorName: 'Someone',
          title: survey.data.title,
          description: survey.data.description
        })
      }

      questionText += formatQuestion(question.text, idx + 1, questions.length)
      const addQuestionFn = question.type === 'multi' ? addMultipleChoiceQuestion : addTextQuestion
      addQuestionFn(convo, questionText, question, ({text}) => recordAnswer(question.id, text))
    }

    convo.on('end', (convo) => {
      recordCompletion()
      bot.say({
        text: 'All done. Thanks for taking this survey! I\'ll remove this space in a few seconds so as not to clutter up your list of Spark spaces.',
        ...messageBase
      })
    })
  })
}
