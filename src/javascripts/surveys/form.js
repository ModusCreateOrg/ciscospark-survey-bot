(function() {
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
    room: {}
  })

  const selector = '#survey-form'
  const surveyData = $(selector).data('survey') || { data: newSurvey() }
  const roomData = $(selector).data('rooms')

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
      rooms: roomData,
      isConducting: false,
      questionSortOptions: {
        handle: '.question-sort-handle',
      },
      choiceSortOptions: {
        handle: '.choice-sort-handle',
      },
    },
    mounted: function () {
      const list = this.rooms.map(({id, title}) => ({ label: title, value: id }))

      new Awesomplete(this.$refs.roomsInput, {
        list,
        minChars: 0,
        maxItems: 20,
      })
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
        $el = $(event.target).parents(selector)
        $el.slideUp(() => {
          $el.show() // otherwise collection.splice removes the wrong element
          collection.splice(collection.indexOf(item), 1)
          if (collection.length < minNumberOfElements) {
            setTimeout(addNewItem, 500)
          }
        })
      },
      _validate: function () {
        this.$el.reportValidity()
        return this.$el.checkValidity()
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
      _setRoom: function (room) {
        this.survey.room = {}
        setTimeout(() => { this.survey.room = room }, 0)
      },
      roomSelected: function ({text: {value, label}}) {
        this._setRoom({title: label, id: value})
      },
      roomSelectionCancel: function (event) {
        this._setRoom(this.survey.room)
      },
      dragChoiceStart: function (choices) {
        this.draggingChoices = choices
      },
      dragChoiceEnd: function ({newIndex, oldIndex}) {
        const choices = this.draggingChoices

        // HACK: reorder them, because vue.draggable isn't doing it itself
        const element = choices[oldIndex]
        choices.splice(oldIndex, 1)
        choices.splice(newIndex, 0, element)
      }
    }
  })

  // Hack to kick vue.draggable
  setTimeout(() => {
    surveyForm.survey.questions.push(newQuestion())
    surveyForm.survey.questions.pop()
  }, 0)
})()
