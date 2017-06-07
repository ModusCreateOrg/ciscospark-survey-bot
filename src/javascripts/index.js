const questionTypes = ['text', 'multi']

const newChoice = () => ({
  text: '',
})

const newQuestion = () => ({
  text: '',
  type: questionTypes[0],
  choices: [newChoice()],
})

const postJSON = (url, json) =>
  fetch(url, {
    method: 'post',
    credentials: 'include',
    body: JSON.stringify(json),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return response.json()
  })

const surveyForm = new Vue({
  el: '#survey-form',
  data: {
    questionTypes,
    survey: {
      title: "",
      questions: [newQuestion()]
    }
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
      postJSON('/surveys', this.survey)
        .then(console.log)
        .catch(console.error)
    }
  }
})
