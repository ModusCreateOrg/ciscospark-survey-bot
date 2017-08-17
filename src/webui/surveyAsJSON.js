import find from 'lodash/find'
import fromPairs from 'lodash/fromPairs'
import includes from 'lodash/includes'
import map from 'lodash/map'
import uniq from 'lodash/uniq'

const jsonResponseText = (question, responseText) =>
  question.type === 'multi'
    ? question.choices[parseInt(responseText) - 1].text
    : responseText

const jsonResponse = (question, {response, surveyTakerId}, surveryTakersIdToEmail) => ({
  text: jsonResponseText(question, response),
  surveyTakerEmail: surveryTakersIdToEmail[surveyTakerId],
})

const jsonQuestions = (questions, surveyResponses, surveyTakers) => {
  const surveryTakersIdToEmail = fromPairs(surveyTakers.map(({id, userData: {personEmail}}) => [id, personEmail]))

  return questions.map(question => {
    const responses = surveyResponses
      .filter(({questionId}) => questionId === question.id)
      .map(response => jsonResponse(question, response, surveryTakersIdToEmail))

    return { responses, ...question }
  })
}

const jsonSurveyTakers = (surveyTakers, surveyResponses) => {
  const uniqSurveyTakerIds = uniq(map(surveyResponses, 'surveyTakerId'))
  const uniqSurveyTakers = surveyTakers.filter(({id}) => includes(uniqSurveyTakerIds, id))

  return uniqSurveyTakers.map(({id, userData: {personId, personEmail, personDisplayName}}) => ({
    email: personEmail,
    name: personDisplayName,
  }))
}

export default ({ survey, surveyTakers, surveyResponses }) => ({
  ...survey.data,
  surveyTakers: jsonSurveyTakers(surveyTakers, surveyResponses),
  questions: jsonQuestions(survey.data.questions, surveyResponses, surveyTakers),
})
