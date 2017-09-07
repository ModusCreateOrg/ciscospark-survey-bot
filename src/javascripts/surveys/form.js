/* eslint-env browser */
/* global $ Vue fetchJSON */

(function () {
  const questionTypes = ['text', 'multi']

  const newChoice = () => ({
    text: ''
  })

  const newQuestion = () => ({
    id: Math.random().toString(16).substring(2),
    text: '',
    type: questionTypes[0],
    choices: [newChoice(), newChoice()]
  })

  const newSurvey = () => ({
    title: '',
    description: '',
    questions: [newQuestion()],
    room: {},
    whoType: 'space'
  })

  const selector = '#survey-form'
  const surveyData = $(selector).data('survey') || { data: newSurvey() }

  const save = ({id, survey}) => {
    const [ method, path ] = id ? ['put', `/surveys/${id}`] : ['post', '/surveys']
    return fetchJSON(method, path, survey)
  }

  const conduct = ({id}) => fetchJSON('POST', `/surveys/${id}/conduct`)

  const surveyForm = new Vue({
    el: selector,
    data: {
      questionTypes,
      id: surveyData.id,
      survey: surveyData.data,
      isConducting: false,
      questionSortOptions: {
        handle: '.question-sort-handle'
      },
      choiceSortOptions: {
        handle: '.choice-sort-handle'
      },
      emailAddresses: [],
      emailAddressesText: ''
    },
    methods: {
      addQuestion: function () {
        this.survey.questions.push(newQuestion())
      },
      addChoice: function (choices) {
        choices.push(newChoice())
      },
      removeQuestion: function () {
        this._remove(...arguments, '.question', 1, () => this.addQuestion())
      },
      removeChoice: function (choices, choice, event) {
        this._remove(choices, choice, event, '.choice', 2, () => this.addChoice(choices))
      },
      _remove: function (collection, item, event, selector, minNumberOfElements, addNewItem) {
        const $el = $(event.target).parents(selector)
        $el.slideUp(() => {
          $el.show() // otherwise collection.splice removes the wrong element
          collection.splice(collection.indexOf(item), 1)
          if (collection.length < minNumberOfElements) {
            setTimeout(addNewItem, 500)
          }
        })
      },
      _validate: function () {
        return this.$el.reportValidity()
      },
      saveDraft: async function () {
        if (!this._validate()) return

        await save(this)
        window.location = '/'
      },
      conduct: async function () {
        if (!this._validate()) return

        const survey = await save(this)

        this.isConducting = true
        await conduct(survey)
        window.location = `/surveys/${survey.id}`
      },

      // HACK: reorder them, because vue.draggable isn't doing it itself
      dragChoiceEnd: function ({newIndex, oldIndex}) {
        const choices = this.draggingChoices

        const element = choices[oldIndex]
        choices.splice(oldIndex, 1)
        choices.splice(newIndex, 0, element)
      },
      // HACK: because dragChoiceEnd, when taking `choices` as an argument,
      // can't reorder them by modifying the array, but it can if it modifies
      // this array
      dragChoiceStart: function (choices) {
        this.draggingChoices = choices
      },
      who: function (whoType) {
        return this.survey.whoType === whoType
      },
      // HACK: Vue won't updated the text field when the model changes without this
      _kickEmailAddressesField: function () {
        const original = this.survey.description
        this.survey.description += ' '
        this.survey.description = original
      },
      parseEmailAddresses: function () {
        this.survey.emailAddresses = window['emailjs-addressparser']
          .parse(this.survey.emailAddressesText.replace(/[\t\n]+/, ','))
          .filter(({address}) => address)

        this.survey.emailAddressesText = this.survey.emailAddresses
          .map(({name, address}) => name ? `${name} <${address}>` : address)
          .join(', ')

        this._kickEmailAddressesField()
      }
    }
  })

  // HACK: kick vue.draggable
  setTimeout(() => {
    surveyForm.survey.questions.push(newQuestion())
    surveyForm.survey.questions.pop()
  }, 0)
})()
