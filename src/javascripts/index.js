const questionTypes = ['text', 'multi']

const newChoice = () => ({
  text: '',
})

const newQuestion = () => ({
  text: '',
  type: questionTypes[0],
  choices: [newChoice()],
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
      console.log(JSON.stringify(this.survey))
    }
  }
})
