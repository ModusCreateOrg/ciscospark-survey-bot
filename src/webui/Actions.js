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


import DummySparkClient from './DummySparkClient'
import SparkClient from './SparkClient'


export default class {
  constructor (user, controller, bot) {
    this.userId = user.profile.id

    const SparkClientClass = user.isLocal ? DummySparkClient : SparkClient
    this.sparkClient = new SparkClientClass(user)
  }

  listSurveys = () => Survey.allAsync({where: { userSparkId: this.userId }})

  createSurvey = data => Survey.createAsync({ userSparkId: this.userId, data })

  getSurvey = id => Survey.findOneAsync({where: { userSparkId: this.userId, id }})

  async updateSurvey (id, attributes) {
    await Survey.updateAsync({ userSparkId: this.userId, id}, attributes)
    return this.getSurvey(id)
  }

  conductSurvey (id) {
    return this.updateSurvey(id, { state: 'active' })
  }

  listRooms () {
    return this.sparkClient.listRooms(...arguments)
  }

  listRoomMembers () {
    return this.sparkClient
  }
}
