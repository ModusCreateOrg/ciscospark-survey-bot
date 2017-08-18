(function() {
  const selector = '#survey'
  const $surveyEl = $(selector)
  const surveyUrl = $surveyEl.data('surveyUrl')
  const surveyId = $surveyEl.data('id')
  const surveyToken = $surveyEl.data('subscriptionToken')

  const surveyResults = new Vue({
    el: selector,
    data: {
      id: surveyId,
      survey: {},
    },
    methods: {
      responsesByChoice: function ({choices, responses}) {
        return choices.map(choice => {
          const choiceResponses = responses.filter(({text}) => text === choice)
          return [choice, choiceResponses.length, choiceResponses]
        })
      },
    }
  })

  const fetchResponses = () => fetchJSON('GET', surveyUrl).then(setResponses)

  const setResponses = data => { surveyResults.$data.survey = data }

  fetchResponses()

  socket = io('/')
  socket.on('connect', () => socket.emit('subscribe:survey', surveyToken))
  socket.on('survey updated', fetchResponses)
})()
