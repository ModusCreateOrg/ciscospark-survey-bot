import json2csv from 'json2csv'
import promisify from 'promisify-node'
import flatMap from 'lodash/flatMap'
import fromPairs from 'lodash/fromPairs'

const json2csvAsync = promisify(json2csv)

export const surveyAsCSVAsJSON = ({ questions, surveyTakers }) => {
  const nameForEmail = fromPairs(surveyTakers.map(({email, name}) => [email, name]))

  return flatMap(questions, ({text: questionText, type, responses}) =>
    responses.map(({text, surveyTakerEmail}) => ({
      'question': questionText,
      'question.type': type,
      'response':  text,
      'person.email': surveyTakerEmail,
      'person.name': nameForEmail[surveyTakerEmail],
    }))
  )
}


export default (data) => json2csvAsync({
  data: surveyAsCSVAsJSON(data),
})
