import u from './helpers/unindent'
import markdownQuote from './helpers/markdownQuote'

const shareResults = async (bot, { surveyAsJSON, renderChartForResponses }) => {
  const messageBase = { channel: surveyAsJSON.room.id }

  const title = u(`
    **Results from ${surveyAsJSON.title}**
    ${surveyAsJSON.description}

    Number of responses: ${Object.keys(surveyAsJSON.surveyTakers).length}
  `)
  bot.say({ text: title, ...messageBase })


  console.log(surveyAsJSON.questions)
  for (const questionIdx in surveyAsJSON.questions) {
    const question = surveyAsJSON.questions[questionIdx]

    let questionText = `
      **Question ${parseInt(questionIdx) + 1} of ${surveyAsJSON.questions.length}**

      ${question.text}

    `

    if (question.type == 'multi') {
      for (const choiceIdx in question.responsesByChoice) {
        const [choiceText, responsesCount, _responders] = question.responsesByChoice[choiceIdx]
        questionText += `
          ${parseInt(choiceIdx) + 1}. *${choiceText}*: **${responsesCount}**
        `
      }
    } else {
      for (const { text, surveyTakerEmail } of question.responses) {
        const name = surveyAsJSON.surveyTakers[surveyTakerEmail].name
        questionText += `
          ${markdownQuote(text)}
          — *${name}*
        `
      }
    }


    bot.say({ text: u(questionText), ...messageBase })

    if (question.type === 'multi') {
      const chart = await renderChartForResponses(question.responsesByChoice)
      bot.say({ files: [chart], ...messageBase })
    }
  }
}

export default shareResults
