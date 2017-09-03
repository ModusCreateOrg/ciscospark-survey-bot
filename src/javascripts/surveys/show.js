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
      survey: {}
    }
  })

  const fetchResponses = () => fetchJSON('GET', surveyUrl).then(setResponses)

  const setResponses = data => { surveyResults.$data.survey = data }

  fetchResponses()

  const socket = io('/')
  socket.on('connect', () => socket.emit('subscribe:survey', surveyToken))
  socket.on('survey updated', fetchResponses)
})()
