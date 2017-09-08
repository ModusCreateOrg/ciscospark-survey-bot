import test from 'ava'

import every from 'lodash/every'
import keyBy from 'lodash/keyBy'
import map from 'lodash/map'
import uniq from 'lodash/uniq'
import shuffle from 'lodash/shuffle'
import sortBy from 'lodash/sortBy'
import sinon from 'sinon'

import SparkUser from '../../src/webui/SparkUser'

// For an actual account we set up for use with this test suite
const SPARK_USER_ACCESS_TOKEN = 'Y2Q0MjNiNDMtODMyNi00ZDE2LTgwNTktY2ZlNDVjMWQ1ZWIxOWY3OWJkMTctYTI4'

// Fake -- no real account like this exists
const SPARK_BOT_EMAIL = 'survey-bot@example.com'

const ROOMS = {
  teamGeneral: 'Y2lzY29zcGFyazovL3VzL1JPT00vNDcwY2ExNTAtOTA0Ni0xMWU3LWJmM2YtNzE1MzJmMTVhODBh',
  notInTeam: 'Y2lzY29zcGFyazovL3VzL1JPT00vYjY2YTI2ZDAtOTA0Ni0xMWU3LTk5YWUtM2IzMWJhMGI0YzY5',
  inTeamButUserNotInRoom: 'Y2lzY29zcGFyazovL3VzL1JPT00vYTI5NTU0NzAtOTA0OC0xMWU3LTk5MWMtZTczNDYyNGI1MjEx'
}

test.beforeEach(({ context }) => {
  context.sparkUser = new SparkUser(
    { accessToken: SPARK_USER_ACCESS_TOKEN },
    [SPARK_BOT_EMAIL]
  )
})

test('listRooms gets all the rooms the user is in, or is in their team', async t => {
  const { sparkUser } = t.context

  const rooms = await sparkUser.listRooms()

  const roomsById = keyBy(rooms, 'id')
  t.truthy(roomsById[ROOMS.teamGeneral].teamName === 'Survey Bot Test Suite Team')
  t.truthy(roomsById[ROOMS.notInTeam].teamName === undefined)
  t.truthy(roomsById[ROOMS.inTeamButUserNotInRoom].teamName === 'Survey Bot Test Suite Team 3')

  const roomIds = map(rooms, 'id')
  const uniqueRoomIds = uniq(roomIds)
  t.deepEqual(roomIds, uniqueRoomIds)
})

const assertSeesMembers = async (t, roomId) => {
  const { sparkUser } = t.context

  const members = await sparkUser.listRoomMembers(roomId)

  t.true(members.length > 0)
  t.true(every(map(members, 'personId'), String))
}

test("listRoomMembers for user's team's General room", async t => {
  await assertSeesMembers(t, ROOMS.teamGeneral)
})

test("listRoomMembers for room that user is in but not a member of the team's room", async t => {
  await assertSeesMembers(t, ROOMS.notInTeam)
})

test("listRoomMembers for room that user is not a member of but is a member of the room's team", async t => {
  await assertSeesMembers(t, ROOMS.inTeamButUserNotInRoom)
})

test('listRoomMembers ignores bots and the survey bot user', async t => {
  const { sparkUser } = t.context
  const roomId = ROOMS.withUsersToIgnore

  const membersToFilter = [
    { personEmail: 'bot1@sparkbot.io' },                  // *@sparkbot.io
    { personEmail: 'bob2@sparkbot.io' },                  //
    { personEmail: SPARK_BOT_EMAIL },                     // email of the survey bot
    { personEmail: 'spark-cisco-it-admin-bot@cisco.com' } // this email specifically
  ]

  const membersToAllow = [
    { personEmail: 'bob@thepriceisright.tv' },
    { personEmail: 'otherperson@cisco.com' }
  ]

  sparkUser._list = sinon.stub().resolves(
    shuffle(membersToFilter.concat(membersToAllow))
  )

  const members = await sparkUser.listRoomMembers(roomId)

  t.true(sparkUser._list.calledWith('memberships', { roomId }))
  t.deepEqual(
    sortBy(members, 'personEmail'),
    sortBy(membersToAllow, 'personEmail')
  )
})
