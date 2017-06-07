const questionTypes = ['text', 'multi']

const newChoice = () => ({
  text: '',
})

const newQuestion = () => ({
  text: '',
  type: questionTypes[0],
  choices: [newChoice()],
})

const newSurvey = () => ({
  title: '',
  description: '',
  questions: [newQuestion()],
})

const fetchJSON = (method, url, json) =>
  fetch(url, {
    method,
    credentials: 'include',
    body: JSON.stringify(json),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then((response) => {
    if (!response.ok) throw new Error(response.statusText)
    return response.json()
  })

const selector = '#survey-form'
const surveyData = $(selector).data('survey') || { data: newSurvey() }

const surveyForm = new Vue({
  el: selector,
  data: {
    questionTypes,
    id: surveyData.id,
    survey: surveyData.data,
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
    submit: function () {
      const [ method, path ] = this.id ? ['put', `/surveys/${this.id}`] : ['post', '/surveys']
      fetchJSON(method, path, this.survey)
        .then(() => {
          window.location = '/'
        })
        .catch(console.error)
    }
  }
})


$(document).on('click', '[link-href]', function () {
  window.location = $(this).attr('link-href')
})
