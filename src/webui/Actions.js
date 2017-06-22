import { Schema } from 'caminte'
import { promisifyAll } from 'bluebird'
import uuid from 'uuid/v4'

var schema = new Schema('redis', {
  driver     : "redis",
  host       : "localhost",
  port       : "6379",
  database   : "test"
});

const Survey = schema.define('Survey', {
  // id:          { type: String, default: uuid, index: true },
  userSparkId: { type: String, index: true },
  data:        { type: schema.Json },
});

promisifyAll(Survey, {
  // b/c of this: http://bluebirdjs.com/docs/error-explanations.html#error-cannot-promisify-an-api-that-has-normal-methods
  filter: (name, func, target, passesDefaultFilter) =>
    passesDefaultFilter && !name.match(/Async$/)
})


import DummySparkClient from './DummySparkClient'
import SparkClient from './SparkClient'


export default class {
  constructor (user) {
    this.userId = user.profile.id

    const SparkClientClass = user.isLocal ? DummySparkClient : SparkClient
    this.sparkClient = new SparkClientClass(user)
  }

  listSurveys = () => Survey.allAsync({where: { userSparkId: this.userId }})

  createSurvey = data => Survey.createAsync({ userSparkId: this.userId, data })

  getSurvey = id => Survey.findOneAsync({where: { userSparkId: this.userId, id }})

  updateSurvey = (id, data) => Survey.updateAsync({ userSparkId: this.userId, id}, {data})

  listRooms = function () { return this.sparkClient.listRooms(...arguments) }
}
