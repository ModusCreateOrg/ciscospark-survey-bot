import test from 'ava'
import sinon from 'sinon'
import setupBot from '../helpers/setupBot'

test.beforeEach(setupBot)
test.beforeEach(({ context }) => { context.user = context.bot.createUser() })

test('bot gives a survey', async t => {
  const { bot, controller, user } = t.context

  const survey = {
    id: '143',
    data: {
      questions: [
        { text: 'What is your favorite color?', type: 'text', id: 1 },
        { text: 'What is your favorite sport?', type: 'text', id: 2 }
      ]
    }
  }
  const recordAnswer = sinon.stub()
  const recordCompletion = sinon.stub()

  controller.trigger(
    'survey_started',
    [bot, { survey, roomId: user.channel, personEmail: user.id, recordAnswer, recordCompletion }]
  )

  const firstQuestion = await bot.nextResponse()
  t.is(firstQuestion.text, 'What is your favorite color?')
  t.is(firstQuestion.channel, user.channel)

  const favoriteColor = 'blue'
  user.says(favoriteColor)

  const secondQuestion = await bot.nextResponse()
  t.is(secondQuestion.text, 'What is your favorite sport?')

  const favoriteSport = 'fuß'
  user.says(favoriteSport)

  const next = await bot.nextResponse()
  t.is(next.text, 'Thanks for your responses!')

  t.true(recordAnswer.calledWith(survey.data.questions[0].id, favoriteColor))
  t.true(recordAnswer.calledWith(survey.data.questions[1].id, favoriteSport))
  t.true(recordCompletion.calledOnce)
})

test('bot gives a survey with mulitple choice question', async t => {
  const { bot, controller, user } = t.context

  const survey = {
    id: '143',
    data: {
      questions: [
        { text: 'What is your favorite color?', type: 'text', id: 1 },
        { text: 'Mac or PC?', type: 'multi', choices: [{ text: 'Mac' }, { text: 'PC' }], id: 2 }
      ]
    }
  }
  const recordAnswer = sinon.stub()
  const recordCompletion = sinon.stub()

  controller.trigger(
    'survey_started',
    [bot, { survey, roomId: user.channel, personEmail: user.id, recordAnswer, recordCompletion }]
  )

  const firstQuestion = await bot.nextResponse()
  t.is(firstQuestion.text, 'What is your favorite color?')
  t.is(firstQuestion.channel, user.channel)

  const favoriteColor = 'blue'
  user.says(favoriteColor)

  const secondQuestion = await bot.nextResponse()
  t.is(secondQuestion.text, 'Mac or PC?\n1. Mac\n2. PC')

  const mac = '1'
  user.says(mac)

  const next = await bot.nextResponse()
  t.is(next.text, 'Thanks for your responses!')

  t.true(recordAnswer.calledWith(survey.data.questions[0].id, favoriteColor))
  t.true(recordAnswer.calledWith(survey.data.questions[1].id, mac))
  t.true(recordCompletion.calledOnce)
})

test('bot requires number of mutiple choice answer', async t => {
  const { bot, controller, user } = t.context

  const survey = {
    id: '147',
    data: {
      questions: [
        { text: 'Mac or PC?', type: 'multi', choices: [{ text: 'Mac' }, { text: 'PC' }], id: 1 }
      ]
    }
  }
  const recordAnswer = sinon.stub()
  const recordCompletion = sinon.stub()

  controller.trigger(
    'survey_started',
    [bot, { survey, roomId: user.channel, personEmail: user.id, recordAnswer, recordCompletion }]
  )

  const question = await bot.nextResponse()
  t.is(question.text, 'Mac or PC?\n1. Mac\n2. PC')

  user.says('Dell')

  let next = await bot.nextResponse()
  t.is(next.text, 'Please enter the number corresponding to your answer.')
  next = await bot.nextResponse()
  t.is(next.text, 'Mac or PC?\n1. Mac\n2. PC')

  user.says('3')

  next = await bot.nextResponse()
  t.is(next.text, 'Please enter the number corresponding to your answer.')
  next = await bot.nextResponse()
  t.is(next.text, 'Mac or PC?\n1. Mac\n2. PC')

  const mac = '1'
  user.says(mac)

  next = await bot.nextResponse()
  t.is(next.text, 'Thanks for your responses!')

  t.true(recordAnswer.calledWith(survey.data.questions[0].id, mac))
  t.true(recordCompletion.calledOnce)
})
