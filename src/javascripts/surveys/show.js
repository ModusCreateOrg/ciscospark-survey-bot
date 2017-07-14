const selector = '#survey'
const $surveyEl = $(selector)
const survey = $surveyEl.data('survey')
const surveyResponsesUrl = $surveyEl.data('responsesUrl')
const surveyToken = $surveyEl.data('subscriptionToken')

const surveyResults = new Vue({
  el: selector,
  data: {
    id: survey.id,
    responsesByQuestion: {},
    survey,
  },
  methods: {
    questionAndResponses: function () {
      return this.survey.data.questions.map(question => {
        const responses = this.responsesByQuestion[question.id] || []
        return {
          question,
          responses,
        }
      })
    },
    responsesFor: function (question, responses) {
      return question.choices.map( (choice, index) =>
        [choice, responses.filter(({response}) => response === `${index + 1}`)]
      )
    },
    pieChartData: function (question, responses) {
      console.log({question, responses})
      const dataAsMap = {}
      for (const response of responses) {
        const answerText = question.choices[response.response - 1].text
        dataAsMap[answerText] = dataAsMap[answerText] || 0
        dataAsMap[answerText] += 1
      }
      console.log(dataAsMap)
      const pieChartData = []
      for (const answerText in dataAsMap) {
        pieChartData.push([answerText, dataAsMap[answerText]])
      }
      console.log(pieChartData)
      return pieChartData
    },
  }
})

const fetchResponses = async () => {
  setResponses(await fetchJSON('GET', surveyResponsesUrl))
}

const setResponses = data => {
  surveyResults.$data.responsesByQuestion = data
}

window.surveyResults = surveyResults
$('#clear-responses').click(() => setResponses({}))
$('#restore-responses').click(fetchResponses)

fetchResponses()


socket = io('/')

socket.on('connect', () => socket.emit('subscribe:survey', surveyToken))

socket.on('survey updated', () => {
  console.log('survey updated')
  fetchResponses()
})
