import test from 'ava'

import map from 'lodash/map'
import includes from 'lodash/includes'

import SparkUser from '../../src/webui/SparkUser'

const SPARK_USER_ACCESS_TOKEN = 'Y2Q0MjNiNDMtODMyNi00ZDE2LTgwNTktY2ZlNDVjMWQ1ZWIxOWY3OWJkMTctYTI4'

test('listRooms gets all the rooms the user is in, or is in their team', async t => {
  const sparkUser = new SparkUser({ accessToken: SPARK_USER_ACCESS_TOKEN })

  const testTeamGeneral = 'Y2lzY29zcGFyazovL3VzL1JPT00vNDcwY2ExNTAtOTA0Ni0xMWU3LWJmM2YtNzE1MzJmMTVhODBh'
  const testRoomNotInTeam = 'Y2lzY29zcGFyazovL3VzL1JPT00vYjY2YTI2ZDAtOTA0Ni0xMWU3LTk5YWUtM2IzMWJhMGI0YzY5'
  const roomInTeamButUserNotInRoom = 'Y2lzY29zcGFyazovL3VzL1JPT00vYTI5NTU0NzAtOTA0OC0xMWU3LTk5MWMtZTczNDYyNGI1MjEx'

  const rooms = await sparkUser.listRooms()
  console.log(rooms)

  const roomIds = map(rooms, 'id')

  t.true(includes(roomIds, testTeamGeneral ))
  t.true(includes(roomIds, testRoomNotInTeam ))
  t.true(includes(roomIds, roomInTeamButUserNotInRoom ))
})
