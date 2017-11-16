import { Schema } from 'caminte'
import { promisifyAll } from 'bluebird'
import redisUrl from 'redis-url'
import uuid from 'uuid/v4'
import map from 'lodash/map'

import renderChart from './renderChart'
import shareResultsFn from './shareResults'
import { allowDevLogin } from '../env'

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
  userSparkId: { type: schema.String, index: true },
  data: { type: schema.JSON },
  state: { type: schema.String, default: 'draft' },
  created: { type: schema.Date, default: Date.now },
  token: { type: schema.String, default: uuid }
})

const SurveyTaker = schema.define('SurveyTaker', {
  surveyId: { type: schema.Number, index: true },
  userData: { type: schema.JSON },
  userSparkId: { type: schema.String, index: true },
  roomId: { type: schema.String },

  // Caminte's Redis adapter doesn't correctly support Boolean so use a string instead
  isFinished: { type: schema.String, default: 'false', index: true }
})

const SurveyResponse = schema.define('SurveyResponse', {
  surveyTakerId: { type: schema.Number, index: true },
  questionId: { type: schema.String, index: true },
  response: { type: schema.String }
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
  constructor ({ user, controller, bot, io }) {
    this.userId = user.profile.id
    this.userDisplayName = user.profile.displayName

    this.sparkBot = new SparkBot(controller, bot)

    const SparkUserClass = user.isLocal ? DummySparkUser : SparkUser

    const botEmails = controller.identity
      ? controller.identity.emails
      : (allowDevLogin && ['surveyBot@example.com'])

    this.sparkUser = new SparkUserClass(user, botEmails)

    this.io = io
  }

  listSurveys = () => Survey.allAsync({where: { userSparkId: this.userId }})

  createSurvey = data => Survey.createAsync({ userSparkId: this.userId, data })

  createSurveyTaker = (userData, surveyId) =>
    SurveyTaker.createAsync({ userSparkId: userData.id, userData, surveyId })

  updateSurveyTaker = (surveyTakerId, attributes) =>
    SurveyTaker.updateAsync({ id: surveyTakerId }, attributes)

  getSurveyTakers = surveyId =>
    SurveyTaker.allAsync({ where: { surveyId } })

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

  emitSurveyUpdated (surveyToken) {
    this.io.to(surveyToken).emit('survey updated')
  }

  saveSurveyResponse = async (questionId, response, surveyToken, surveyTakerId) => {
    await SurveyResponse.createAsync({ questionId, response, surveyTakerId })
    this.emitSurveyUpdated(surveyToken)
  }

  saveSurveyCompletion = async (surveyTakerId, surveyId) => {
    await SurveyTaker.updateAsync({ id: surveyTakerId }, { isFinished: 'true' })
    const unfinished = await SurveyTaker.countAsync({ surveyId, isFinished: 'false' })
    if (unfinished === 0) {
      const survey = await this.updateSurvey(surveyId, { state: 'complete' })
      this.emitSurveyUpdated(survey.token)
    }
  }

  async updateSurvey (id, attributes) {
    await Survey.updateAsync({ userSparkId: this.userId, id }, attributes)
    return await this.getSurvey(id)
  }

  async deleteSurvey (id) {
    const { survey, surveyTakers, surveyResponses } = await this.getSurveyAndAllResponses(id)
    await Promise.all([
      Survey.removeAsync({ where: { id: survey.id } }),
      SurveyTaker.removeAsync({ where: { id: map(surveyTakers, 'id') } }),
      SurveyResponse.removeAsync({ where: { id: map(surveyResponses, 'id') } })
    ])
  }

  _roomMembersForSurvey = async survey =>
    survey.data.whoType === 'space'
      ? await this.listRoomMembers(survey.data.room.id)
      : survey.data.emailAddresses.map(({name, address}) => ({
        id: address,
        personEmail: address,
        personDisplayName: name || address
      }))

  async conductSurvey (id) {
    const survey = await this.updateSurvey(id, { state: 'active' })
    const roomMembers = await this._roomMembersForSurvey(survey)

    await Promise.all(roomMembers.map(async sparkUser => {
      const surveyTaker = await this.createSurveyTaker(sparkUser, survey.id)
      const { personEmail } = sparkUser
      const room = await this.sparkBot.conductUserSurvey(
        personEmail,
        survey,
        this.userDisplayName,
        (...args) => this.saveSurveyResponse(...args, survey.token, surveyTaker.id),
        () => this.saveSurveyCompletion(surveyTaker.id, survey.id)
      )
      await this.updateSurveyTaker(surveyTaker.id, { roomId: room.id })
    }))

    return survey
  }

  listRooms = () => this.sparkUser.listRooms()

  listRoomMembers = roomId => this.sparkUser.listRoomMembers(roomId)

  async shareResults (surveyAsJSON, roomId) {
    const messages = await shareResultsFn({
      surveyAsJSON,
      renderChartForResponses: renderChart
    })
    await this.sparkUser.postMessages(messages, roomId)
  }

  async copySurvey (id) {
    if (id) {
      const survey = await this.getSurvey(id)
      survey.id = undefined
      return survey
    }
  }

  async endSurvey (id) {
    const survey = await this.updateSurvey(id, { state: 'complete' })

    const surveyTakers = await this.getSurveyTakers(id)

    await Promise.all(surveyTakers.map(({roomId}) =>
      this.sparkBot.closeSurveyRoom(roomId)
    ))

    this.emitSurveyUpdated(survey.token)
  }
}
