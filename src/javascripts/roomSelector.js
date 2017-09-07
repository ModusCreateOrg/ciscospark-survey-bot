/* eslint-env browser */
/* global $ Vue fetchJSON Awesomplete */

(function () {
  Vue.component('room-selector', {
    template: `
      <input
        :className="['room-selector', { fetching: isFetching }]"
        type="text"
        @awesomplete-select="roomSelected"
        @blur="roomSelectionCancel"
        name=""
        :value="room.title"
        ref="input"
        :disabled="isFetching"
        :placeholder="placeholderText()"
      />
    `,
    data: () => ({
      room: { id: 2, title: 'hi' },
      isFetching: false,
      awesomplete: null
    }),
    model: { prop: 'room', event: 'change' },
    props: {
      source: { type: String, required: true },
      room: { type: Object, default: function () { return {} } }
    },
    methods: {
      placeholderText: function () {
        return this.isFetching ? 'Loading…' : 'Enter space name'
      },
      _emitRoom: function (room) {
        this.$emit('change', room)
      },
      _setRoom: function (room) {
        // For some reason, this is needed to make cancelling the selection work
        this._emitRoom({})
        setTimeout(() => { this._emitRoom(room) }, 0)
      },
      roomSelected: function ({text: {value, label}}) {
        setTimeout(() => {
          $(this.$refs.input).trigger('blur')
          this._setRoom({title: label, id: value})
        }, 100) // Otherwise, Awesomplete keeps it selected
      },
      roomSelectionCancel: function (event) {
        this._setRoom(this.room)
      }
    },
    mounted: function () {
      this.isFetching = true
      fetchJSON('GET', this.source).then(rooms => {
        this.isFetching = false

        const list = rooms.map(({id, title, teamName}) => {
          const label = teamName
            ? `${teamName} / ${title}`
            : title

          return { label, value: id }
        })

        this.awesomeplete = new Awesomplete(this.$refs.input, {
          list,
          minChars: 0,
          maxItems: 20
        })
      })
    },
    beforeDestroy: function () {
      this.awesomeplete.destroy()
    }
  })
})()
