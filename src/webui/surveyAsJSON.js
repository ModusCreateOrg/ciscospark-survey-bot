import fromPairs from 'lodash/fromPairs'
import map from 'lodash/map'

const jsonResponseText = (question, {response: responseText}) =>
  question.type === 'multi'
    ? question.choices[parseInt(responseText) - 1].text
    : responseText

const jsonQuestions = (questions, surveyResponses, surveyTakers) => {
  const surveryTakersIdToEmail = fromPairs(surveyTakers.map(({id, userData: {personEmail}}) => [id, personEmail]))

  return questions.map(question => {
    const responses = surveyResponses
      .filter(({questionId}) => questionId === question.id)
      .map(response => ({
        text: jsonResponseText(question, response),
        surveyTakerEmail: surveryTakersIdToEmail[response.surveyTakerId]
      }))

    const choices = map(question.choices, 'text')

    const responsesByChoice = choices.map(choice => {
      const choiceResponses = responses.filter(({text}) => text === choice)
      return [choice, choiceResponses.length, choiceResponses]
    })

    return { ...question, responses, choices, responsesByChoice }
  })
}

const jsonSurveyTakers = (surveyTakers) => fromPairs(
  surveyTakers.map(({userData}) =>
    [userData.personEmail, {name: userData.personDisplayName}]
  )
)

export default ({ survey, surveyTakers, surveyResponses }) => ({
  ...survey.data,
  surveyTakers: jsonSurveyTakers(surveyTakers),
  questions: jsonQuestions(survey.data.questions, surveyResponses, surveyTakers)
})
