import { Schema } from 'caminte'
import { promisifyAll } from 'bluebird'
import redisUrl from 'redis-url'
import uuid from 'uuid/v4'
import map from 'lodash/map'

import renderChart from './renderChart'
import shareResultsFn from './shareResults'

const redisOptions = () => {
  const {
    port,
    hostname: host,
    password
  } = redisUrl.parse(process.env.REDIS_URL)

  return {
    port,
    host,
    password
  }
}
const schema = new Schema('redis', redisOptions())

const Survey = schema.define('Survey', {
  userSparkId: { type: String, index: true },
  data: { type: schema.Json },
  state: { type: String, default: 'draft' },
  created: { type: schema.Date, default: Date.now },
  token: { type: String, default: uuid }
})

const SurveyTaker = schema.define('SurveyTaker', {
  surveyId: { type: Number, index: true },
  userData: { type: schema.Json },
  userSparkId: { type: String, index: true },
  isFinished: { type: Boolean, default: false, index: true }
})

const SurveyResponse = schema.define('SurveyResponse', {
  surveyTakerId: { type: Number, index: true },
  questionId: { type: String, index: true },
  response: { type: String }
})

const models = [Survey, SurveyResponse, SurveyTaker]
for (const model of models) {
  promisifyAll(model, {
    // b/c of this: http://bluebirdjs.com/docs/error-explanations.html#error-cannot-promisify-an-api-that-has-normal-methods
    filter: (name, func, target, passesDefaultFilter) =>
      passesDefaultFilter && !name.match(/Async$/)
  })
}

import DummySparkUser from './DummySparkUser'
import SparkUser from './SparkUser'
import SparkBot from './SparkBot'

export default class {
  constructor (user, controller, bot, io) {
    this.userId = user.profile.id
    this.sparkBot = new SparkBot(controller, bot)

    const SparkUserClass = user.isLocal ? DummySparkUser : SparkUser
    this.sparkUser = new SparkUserClass(user)

    this.io = io
  }

  listSurveys = () => Survey.allAsync({where: { userSparkId: this.userId }})

  createSurvey = data => Survey.createAsync({ userSparkId: this.userId, data })

  createSurveyTaker = (userData, surveyId) =>
    SurveyTaker.createAsync({ userSparkId: userData.id, userData, surveyId })

  getSurvey = id => Survey.findOneAsync({where: { userSparkId: this.userId, id }})

  async getSurveyTakersAndResponses (id) {
    const surveyTakers = await SurveyTaker.allAsync({ where: { surveyId: id } })

    const surveyResponses = await SurveyResponse.allAsync({
      where: { surveyTakerId: { in: map(surveyTakers, 'id') } }
    })

    return { surveyTakers, surveyResponses }
  }

  async getSurveyAndAllResponses (id) {
    const [survey, { surveyTakers, surveyResponses }] = await Promise.all([
      this.getSurvey(id),
      this.getSurveyTakersAndResponses(id)
    ])

    return { survey, surveyTakers, surveyResponses }
  }

  saveSurveyResponse = async (questionId, response, surveyToken, surveyTakerId) => {
    await SurveyResponse.createAsync({ questionId, response, surveyTakerId })
    this.io.to(surveyToken).emit('survey updated')
  }

  saveSurveyCompletion = async (surveyTakerId, surveyId) => {
    await SurveyTaker.updateAsync({ id: surveyTakerId }, { isFinished: true })
    const unfinished = await SurveyTaker.countAsync({ surveyId, isFinished: false })
    if (unfinished === 0) {
      await this.updateSurvey(surveyId, { state: 'complete' })
    }
  }

  async updateSurvey (id, attributes) {
    await Survey.updateAsync({ userSparkId: this.userId, id }, attributes)
    return await this.getSurvey(id)
  }

  async conductSurvey (id) {
    const survey = await this.updateSurvey(id, { state: 'active' })
    const roomMembers = survey.data.whoType === 'space'
      ? await this.listRoomMembers(survey.data.room.id)
      : survey.data.emailAddresses.map(({name, address}) => ({
        id: address,
        personEmail: address,
        personDisplayName: name || address
      }))

    // Not async because Spark API client can't handle multiple async requests
    for (const sparkUser of roomMembers) {
      const surveyTaker = await this.createSurveyTaker(sparkUser, survey.id)
      const { personEmail } = sparkUser
      await this.sparkBot.conductUserSurvey(
        personEmail,
        survey,
        (...args) => this.saveSurveyResponse(...args, survey.token, surveyTaker.id),
        () => this.saveSurveyCompletion(surveyTaker.id, survey.id)
      )
    }

    return survey
  }

  listRooms = () => this.sparkUser.listRooms()

  listRoomMembers = roomId => this.sparkUser.listRoomMembers(roomId)

  async shareResults (surveyAsJSON, roomId) {
    const messages = await shareResultsFn({ surveyAsJSON, renderChartForResponses: renderChart })
    await this.sparkUser.postMessages(messages, roomId)
  }
}
