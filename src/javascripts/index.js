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

const save = ({id, survey}) => {
  const [ method, path ] = id ? ['put', `/surveys/${id}`] : ['post', '/surveys']
  return fetchJSON(method, path, survey)
}

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
    saveDraft: async function () {
      await save(this)
      window.location = '/'
    },
    conduct: async function () {
      const survey = save(this)
      window.location = '/'
    }
  }
})


$(document).on('click', '[link-href]', function () {
  window.location = $(this).attr('link-href')
})
