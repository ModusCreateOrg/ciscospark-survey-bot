import { Schema } from 'caminte'
import { promisifyAll } from 'bluebird'
import redisUrl from 'redis-url'
import uuid from 'uuid/v4'

const redisOptions = () => {
  const {
    port,
    hostname: host,
    password,
  } = redisUrl.parse(process.env.REDIS_URL)

  return {
    port,
    host,
    password,
  }
}
const schema = new Schema('redis', redisOptions())

const Survey = schema.define('Survey', {
  userSparkId: { type: String, index: true },
  data:        { type: schema.Json },
  state:       { type: String, default: 'draft' },
})

promisifyAll(Survey, {
  // b/c of this: http://bluebirdjs.com/docs/error-explanations.html#error-cannot-promisify-an-api-that-has-normal-methods
  filter: (name, func, target, passesDefaultFilter) =>
    passesDefaultFilter && !name.match(/Async$/)
})


import DummySparkUser from './DummySparkUser'
import SparkUser from './SparkUser'
import SparkBot from './SparkBot'


export default class {
  constructor (user, controller, bot) {
    this.userId = user.profile.id
    this.sparkBot = new SparkBot(controller, bot)

    const SparkUserClass = user.isLocal ? DummySparkUser : SparkUser
    this.sparkUser = new SparkUserClass(user)
  }

  listSurveys = () => Survey.allAsync({where: { userSparkId: this.userId }})

  createSurvey = data => Survey.createAsync({ userSparkId: this.userId, data })

  getSurvey = id => Survey.findOneAsync({where: { userSparkId: this.userId, id }})

  async updateSurvey (id, attributes) {
    await Survey.updateAsync({ userSparkId: this.userId, id}, attributes)
    return await this.getSurvey(id)
  }

  async conductSurvey (id) {
    const survey = await this.updateSurvey(id, { state: 'active' })
    const roomMembers = await this.listRoomMembers(survey.data.roomId)
    await Promise.all(
      roomMembers.map(({ personEmail }) => this.sparkBot.conductUserSurvey(personEmail, survey))
    )
    return survey
  }

  listRooms () {
    return this.sparkUser.listRooms(...arguments)
  }

  listRoomMembers (roomId) {
    return this.sparkUser.listRoomMembers(roomId)
  }
}
