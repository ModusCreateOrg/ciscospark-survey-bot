import fromPairs from 'lodash/fromPairs'
import includes from 'lodash/includes'
import map from 'lodash/map'
import uniq from 'lodash/uniq'

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
        surveyTakerEmail: surveryTakersIdToEmail[response.surveyTakerId],
      }))

    const choices = map(question.choices, 'text')

    return { ...question, responses, choices }
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
  questions: jsonQuestions(survey.data.questions, surveyResponses, surveyTakers),
})
