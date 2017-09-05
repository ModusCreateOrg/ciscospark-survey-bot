import u from './helpers/unindent'
import markdownQuote from './helpers/markdownQuote'

const shareResults = async (bot, { surveyAsJSON, renderChartForResponses }) => {
  const questionsWithCharts = await Promise.all(
    surveyAsJSON.questions.map(async question =>
      question.type === 'multi'
        ? { ...question, chartStream: await renderChartForResponses(question.responsesByChoice) }
        : question
    )
  )

  bot.startConversation({ channel: surveyAsJSON.room.id }, (err, convo) => {
    if (err) throw(err)

    const title = u(`
      **Results from ${surveyAsJSON.title}**

      ${surveyAsJSON.description}

      Number of responses: ${Object.keys(surveyAsJSON.surveyTakers).length}
    `)
    convo.say({ text: title })

    for (const [questionIdx, question] of questionsWithCharts.entries()) {
      let questionText = `
        **Question ${questionIdx + 1} of ${surveyAsJSON.questions.length}**

        ${question.text}
      `

      if (question.type === 'multi') {
        for (const entry of question.responsesByChoice.entries()) {
          const [choiceIdx, [choiceText, responsesCount]] = entry
          questionText += `
            ${choiceIdx + 1}. *${choiceText}*: **${responsesCount}**
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

      convo.say({ text: u(questionText) })

      if (question.chartStream) {
        // if `text` is undefined or empty string, it *sometimes* won't send the file.
        convo.say({ text: ' ', files: [question.chartStream] })
      }
    }
  })
}

export default shareResults
