import CiscoSpark from 'ciscospark'
import uniqBy from 'lodash/uniqBy'
import flatten from 'lodash/flatten'
import find from 'lodash/find'

const asyncFlatMap = async (...args) => flatten(await asyncMap(...args))
const asyncMap = (items, cb) => Promise.all(items.map(cb))

export default class {
  constructor (user, surveyBotEmails = []) {
    this.user = user

    this.blacklistRegexps = [
      /@sparkbot.io$/
    ]

    this.blacklistEmails = surveyBotEmails.concat([
      'spark-cisco-it-admin-bot@cisco.com'
    ])
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

  isNotBlackListed = ({personEmail}) => !(
    find(this.blacklistRegexps, regexp => personEmail.match(regexp)) ||
    find(this.blacklistEmails, email => personEmail === email)
  )

  // requires scope spark:memberships_read
  listRoomMembers = async roomId =>
    (await this._list('memberships', { roomId })).filter(this.isNotBlackListed)

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

  // requires scope spark:messages_write
  async postMessages (messages, roomId) {
    const spark = this._sparkClient()
    for (const message of messages) {
      await spark.messages.create({ roomId, ...message })
    }
  }
}
