import CiscoSpark from 'ciscospark'
import uniqBy from 'lodash/uniqBy'
import map from 'lodash/map'

const flatMapInSeries = async (items, cb) => {
  const collection = []
  for (const item of items) {
    collection.push(...await cb(item))
  }
  return collection
}

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
  listTeams = async () => (await this._sparkClient().teams.list()).items

  // requires scope spark:rooms_read
  listRoomsInTeam = async ({id}) =>
    (await this._sparkClient().rooms.list({ type: 'group', teamId: id })).items

  // requires scope spark:rooms_read
  listNonTeamRooms = async () =>
    (await this._sparkClient().rooms.list({ type: 'group' })).items

  // requires scope spark:memberships_read
  listRoomMembers = async roomId => {
    const { items } = await this._sparkClient().memberships.list({ roomId })
    return items
  }

  listRooms = async () => {
    const teams = await this.listTeams()
    const teamRooms = await flatMapInSeries(teams, async team =>
      map(await this.listRoomsInTeam(team), room => ({
        ...room, teamName: team.name
      })
    ))
    const nonTeamRooms = await this.listNonTeamRooms()
    return uniqBy(teamRooms.concat(nonTeamRooms), 'id')
  }
}
