import CiscoSpark from 'ciscospark'

export default class {
  constructor (user) {
    this.user = user
  }

  _sparkClient = () => {
    this.__sparkClient = this.__sparkClient || this._buildSparkClient()
    return this.__sparkClient
  }

  _buildSparkClient = () => CiscoSpark.init({
    authorization: {
      access_token: this.user.accessToken
    }
  })

  // requires scope spark:rooms_read
  listRooms = () => this._sparkClient().rooms.list({ type: 'group' }).then(({items}) => items)

  // requires scope spark:memberships_read
  listRoomMembers = async (roomId) => {
    const { items } = await this._sparkClient().memberships.list({ roomId })
    return items
  }
}
