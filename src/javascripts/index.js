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
    title: "",
    message: "Ok",
    questions: [newQuestion()]
  },
  methods: {
    addQuestion: function () {
      this.questions.push(newQuestion())
    },
    addChoice: function (question) {
      question.choices.push(newChoice())
    },
    remove: function (collection, item) {
      collection.splice(collection.indexOf(item), 1)
    }
  }
})
