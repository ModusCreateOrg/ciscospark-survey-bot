const userId = 'someId'

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
    questionAndResponses: function() {
      return this.survey.data.questions.map(question =>
        [question, this.responsesByQuestion[question.id] || []]
      )
    },
    responsesFor: function(question, responses) {
      return question.choices.map( (choice, index) =>
        [choice, responses.filter(({response}) => response === `${index + 1}`)]
      )
    }
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
