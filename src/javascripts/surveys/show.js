const userId = 'someId'

socket = io('/')
socket.on('connect', () => socket.emit('join', userId))
socket.on('survey updated', (data) => console.log('SHOULD get this', data))

const selector = '#survey'
const survey = $(selector).data('survey')
const responsesByQuestion = $(selector).data('responsesByQuestion')

const surveyResults = new Vue({
  el: selector,
  data: {
    id: survey.id,
    survey,
    responsesByQuestion
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
