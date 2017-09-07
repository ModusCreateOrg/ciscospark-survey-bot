import u from '../handlers/helpers/unindent'
import markdownQuote from '../handlers/helpers/markdownQuote'

const shareResults = async ({ surveyAsJSON, postMessages, renderChartForResponses }) => {
  const questionsWithCharts = await Promise.all(
    surveyAsJSON.questions.map(async question =>
      question.type === 'multi'
      ? { ...question, chartStream: await renderChartForResponses(question.responsesByChoice) }
      : question
    )
  )

  const messages = []

  const title = u(`
    **Results from ${surveyAsJSON.title}**

    ${surveyAsJSON.description}

    Number of responses: ${Object.keys(surveyAsJSON.surveyTakers).length}
  `)
  messages.push({ markdown: title })

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

    messages.push({ markdown: u(questionText) })

    if (question.chartStream) {
      messages.push({ files: [question.chartStream] })
    }
  }

  await postMessages(messages)
}

export default shareResults
