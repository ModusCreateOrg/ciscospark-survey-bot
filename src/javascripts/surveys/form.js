const questionTypes = ['text', 'multi']

const newChoice = () => ({
  text: ''
})

const newQuestion = () => ({
  id: Math.random().toString(16).substring(2),
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
    rooms: roomData
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
    addChoice: function (question) {
      question.choices.push(newChoice())
    },
    remove: function (collection, item) {
      collection.splice(collection.indexOf(item), 1)
    },
    saveDraft: async function () {
      await save(this)
      // window.location = '/'
    },
    conduct: async function () {
      const survey = await save(this)
      await conduct(survey)
      // window.location = '/'
    },
    _setRoomId: function (roomId) {
      this.survey.roomId = null
      setTimeout(() => { this.survey.roomId = roomId }, 0)
    },
    roomSelected: function (event) {
      this._setRoomId(event.text.value)
    },
    roomSelectionCancel: function (event) {
      this._setRoomId(this.survey.roomId)
    },
    roomName: function () {
      const room = this.rooms.filter(({id}) => id === this.survey.roomId)[0]
      return room ? room.title : ''
    }
  }
})
