import CiscoSpark from 'ciscospark'
import uniqBy from 'lodash/uniqBy'

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

  // requires scope spark:teams_read
  listTeams = () => this._sparkClient().teams.list().then(({items}) => items)

  // requires scope spark:rooms_read
  listTeamRoom = ({id}) =>
    this._sparkClient().rooms.list({ type: 'group', teamId: id })

  listRooms = async () => (await this.listTeamRooms()).concat(await this.listNonTeamRooms())

  listTeamRooms = async () => {
    const rooms = []
    // Needs to be serial, because the spark client can't do it in parallel
    for (const team of await this.listTeams()) {
      const {items} = await this.listTeamRoom(team)
      rooms.push(...items)
    }
    return uniqBy(rooms, 'id')
  }

  // requires scope spark:rooms_read
  listNonTeamRooms = () => this._sparkClient().rooms.list({ type: 'group' }).then(({items}) => items)

  // requires scope spark:memberships_read
  listRoomMembers = async (roomId) => {
    const { items } = await this._sparkClient().memberships.list({ roomId })
    return items
  }
}
