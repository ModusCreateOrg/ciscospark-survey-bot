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


const listSurveys = (currentUser) => Survey.allAsync({where: { userSparkId: currentUser.profile.id }})

const createSurvey = (currentUser, data) =>
  Survey.createAsync({ userSparkId: currentUser.profile.id, data })

const getSurvey = (currentUser, id) =>
  Survey.findOneAsync({where: { userSparkId: currentUser.profile.id, id }})

const updateSurvey = (currentUser, id, data) =>
  Survey.updateAsync({ userSparkId: currentUser.profile.id, id}, {data})



import CiscoSpark from 'ciscospark'

const sparkClient = (currentUser) => {
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
      access_token: currentUser.accessToken,
      token_type: 'Bearer',
      refresh_token: currentUser.refreshToken,
    },
  })

  return spark
}

const listRooms = async (currentUser) =>
  sparkClient(currentUser).rooms.list().then(({items}) => items)

export default {
  listSurveys,
  createSurvey,
  getSurvey,
  updateSurvey,
  listRooms,
}
