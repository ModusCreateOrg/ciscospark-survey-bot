const questionTypes = ['text', 'multi']

const newChoice = () => ({
  text: ''
})

const newQuestion = () => ({
  // id: uuid(), // TODO
  text: '',
  type: questionTypes[0],
  choices: [newChoice()]
})

const newSurvey = () => ({
  title: '',
  description: '',
  questions: [newQuestion()],
  roomId: null
})

const fetchJSON = (method, url, json) =>
  fetch(url, {
    method,
    credentials: 'include',
    body: JSON.stringify(json),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) throw new Error(response.statusText)
    return response.json()
  })

const selector = '#survey-form'
const surveyData = $(selector).data('survey') || { data: newSurvey() }
const roomData = $(selector).data('rooms')

console.log('roomData', $(selector).data('rooms'))

const save = ({id, survey}) => {
  const [ method, path ] = id ? ['put', `/surveys/${id}`] : ['post', '/surveys']
  return fetchJSON(method, path, survey)
}

const conduct = ({id}) => {
  return fetchJSON('POST', `/surveys/${id}/conduct`)
}

const surveyForm = new Vue({
  el: selector,
  data: {
    questionTypes,
    id: surveyData.id,
    survey: surveyData.data,
    rooms: roomData
  },
  methods: {
    addQuestion: function () {
      this.survey.questions.push(newQuestion())
    },
    addChoice: function (question) {
      question.choices.push(newChoice())
    },
    remove: function (collection, item) {
      collection.splice(collection.indexOf(item), 1)
    },
    saveDraft: async function () {
      await save(this)
      window.location = '/'
    },
    conduct: async function () {
      const survey = await save(this)
      conduct(survey)
      window.location = '/'
    }
  }
})

$(document).on('click', '[link-href]', function () {
  window.location = $(this).attr('link-href')
})
