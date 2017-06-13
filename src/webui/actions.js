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


import CiscoSpark from 'ciscospark'


export default class {
  constructor(user) {
    this.user = user
    this.userId = user.profile.id
  }

  listSurveys = () => Survey.allAsync({where: { userSparkId: this.userId }})

  createSurvey = data => Survey.createAsync({ userSparkId: this.userId, data })

  getSurvey = id => Survey.findOneAsync({where: { userSparkId: this.userId, id }})

  updateSurvey = (id, data) => Survey.updateAsync({ userSparkId: this.userId, id}, {data})

  _sparkClient = () => {
    this.__sparkClient = this.__sparkClient || this._buildSparkClient()
    return this.__sparkClient
  }

  _buildSparkClient = () => {
    const spark = CiscoSpark.init({
      config: {
        credentials: {
          client_secret: process.env.SPARK_OAUTH__CLIENT_SECRET,
          client_id: process.env.SPARK_OAUTH__CLIENT_ID,
        },
      },
    })

    spark.credentials.set({
      authorization: { // TODO: which of these do we actually need?
        access_token: this.user.accessToken,
        refresh_token: this.user.refreshToken,
        token_type: 'Bearer',
      },
    })

    return spark
  }

  listRooms = () => this._sparkClient().rooms.list().then(({items}) => items)
}
