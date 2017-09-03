import CiscoSpark from 'ciscospark'
import uniqBy from 'lodash/uniqBy'
import flatten from 'lodash/flatten'

const asyncFlatMap = async (...args) => flatten(await asyncMap(...args))
const asyncMap = (items, cb) => Promise.all(items.map(cb))

export default class {
  constructor (user) {
    this.user = user
  }

  _sparkClient = () => CiscoSpark.init({
    authorization: {
      access_token: this.user.accessToken
    }
  })

  // requires scope spark:teams_read
  listTeams = () => this._list('teams')

  // requires scope spark:rooms_read
  listRoomsInTeam = ({id}) => this._list('rooms', { type: 'group', teamId: id })

  // requires scope spark:rooms_read
  listNonTeamRooms = () => this._list('rooms', { type: 'group' })

  // requires scope spark:memberships_read
  listRoomMembers = roomId => this._list('memberships', { roomId })

  _list = async (resource, args = {}) =>
    (await this._sparkClient()[resource].list(args)).items

  listTeamRooms = async () => asyncFlatMap(await this.listTeams(), async team =>
    (await this.listRoomsInTeam(team)).map(room => ({
      ...room, teamName: team.name
    }))
  )

  listRooms = async () => {
    const [teamRooms, nonTeamRooms] = await Promise.all([
      this.listTeamRooms(),
      this.listNonTeamRooms()
    ])
    return uniqBy(teamRooms.concat(nonTeamRooms), 'id')
  }
}
