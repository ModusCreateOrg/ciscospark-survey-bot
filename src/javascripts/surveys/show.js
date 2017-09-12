/* eslint-env browser */
/* global $ Vue fetchJSON io */

(function () {
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
      shareWithRoom: {},
      sharingStatus: 'unshared',
      isEndingSurvey: false
    },
    methods: {
      jsonify: str => JSON.parse(JSON.stringify(str)),
      shareResults: function () {
        this.sharingStatus = 'sharing'
        fetchJSON('POST', `/surveys/${surveyId}/share`, { roomId: this.shareWithRoom.id })
          .then(() => { this.sharingStatus = 'shared' })
      },
      endSurvey: function () {
        this.isEndingSurvey = true
        fetchJSON('POST', `/surveys/${surveyId}/end`)
          .then(() => { this.isEndingSurvey = false })
      }
    }
  })

  const fetchResponses = () => fetchJSON('GET', surveyUrl).then(setResponses)

  const setResponses = data => { surveyResults.$data.survey = data }

  fetchResponses()

  const socket = io('/')
  socket.on('connect', () => socket.emit('subscribe:survey', surveyToken))
  socket.on('survey updated', fetchResponses)
})()
