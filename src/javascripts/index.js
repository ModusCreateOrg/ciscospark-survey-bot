const questionTypes = ['text', 'multi']

const newChoice = () => ({
  text: 'choice-text',
})

const newQuestion = () => ({
  text: 'question-text',
  type: questionTypes[0],
  choices: [newChoice()],
})

const surveyForm = new Vue({
  el: '#survey-form',
  data: {
    questionTypes,
    title: "Default title",
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
