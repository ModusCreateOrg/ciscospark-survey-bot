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
    [bot, { survey, roomForSurvey: { id: user.channel }, personEmail: user.id, recordAnswer, recordCompletion }]
  )

  const firstQuestion = await bot.nextResponse()
  t.is(firstQuestion.channel, user.channel)
  t.regex(firstQuestion.text, /Hi!/)
  t.regex(firstQuestion.text, /Question 1 of 2/)
  t.regex(firstQuestion.text, /What is your favorite color\?/)

  const favoriteColor = 'blue'
  user.says(favoriteColor)

  const secondQuestion = await bot.nextResponse()
  t.regex(secondQuestion.text, /Question 2 of 2/)
  t.regex(secondQuestion.text, /What is your favorite sport\?/)

  const favoriteSport = 'fuß'
  user.says(favoriteSport)

  const next = await bot.nextResponse()
  t.regex(next.text, /Thanks/)

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
    [bot, { survey, roomForSurvey: { id: user.channel }, personEmail: user.id, recordAnswer, recordCompletion }]
  )

  const firstQuestion = await bot.nextResponse()
  t.is(firstQuestion.channel, user.channel)
  t.regex(firstQuestion.text, /What is your favorite color?/)

  const favoriteColor = 'blue'
  user.says(favoriteColor)

  const secondQuestion = await bot.nextResponse()
  t.regex(secondQuestion.text, /Mac or PC\?/)

  const secondQuestionOptions = await bot.nextResponse()
  t.regex(secondQuestionOptions.text, /1. Mac/)
  t.regex(secondQuestionOptions.text, /2. PC/)

  const mac = '1'
  user.says(mac)

  const next = await bot.nextResponse()
  t.regex(next.text, /Thanks/)

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
    [bot, { survey, roomForSurvey: { id: user.channel }, personEmail: user.id, recordAnswer, recordCompletion }]
  )

  const question = await bot.nextResponse()
  t.regex(question.text, /Mac or PC\?/)

  const questionOptions = await bot.nextResponse()
  t.regex(questionOptions.text, /1. Mac/)
  t.regex(questionOptions.text, /2. PC/)

  user.says('Dell')

  let next = await bot.nextResponse()
  t.regex(next.text, /Sorry/)
  next = await bot.nextResponse()
  t.regex(next.text, /1. Mac/)
  t.regex(next.text, /2. PC/)

  user.says('3')

  next = await bot.nextResponse()
  t.regex(next.text, /Sorry/)
  next = await bot.nextResponse()
  t.regex(next.text, /1. Mac/)
  t.regex(next.text, /2. PC/)

  const mac = '1'
  user.says(mac)

  next = await bot.nextResponse()
  t.regex(next.text, /Thanks/)

  t.true(recordAnswer.calledWith(survey.data.questions[0].id, mac))
  t.true(recordCompletion.calledOnce)
})

test('bot sends survey results to space', async t => {
  const { bot, controller, user } = t.context

  const surveyAsJSON = {
    title: 'Lunch options',
    description: 'the description',
    questions: [
      {
        text: 'Do you like spicy food?',
        type: 'multi',
        choices: ['Yes', 'No', "Only if it's not too spicy"],
        responses: [
          { text: 'No', surveyTakerEmail: 'mike@promptworks.com' }
        ],
        responsesByChoice: [
          ['Yes', 0, []],
          ['No', 2, ['mike@promptworks.com', 'bob@promptworks.com']],
          ["Only if it's not too spicy", 0, []]
        ]
      },
      {
        text: 'Please list any dietary restrictions',
        type: 'text',
        responses: [
          { text: 'None', surveyTakerEmail: 'mike@promptworks.com' },
          { text: 'I keep Kosher', surveyTakerEmail: 'bob@promptworks.com' }
        ]
      }
    ],
    room: { id: user.channel, title: 'New York Office' },
    surveyTakers: {
      'mike@promptworks.com': { name: 'Mike Nicholaides' },
      'bob@promptworks.com': { name: 'Bob Barker' }
    }
  }

  const renderChartForResponses = sinon.stub()
  const mockQuestion1Image = { the: 'image' }
  renderChartForResponses.returns(Promise.resolve(mockQuestion1Image))

  controller.trigger(
    'share_results',
    [bot, { surveyAsJSON, renderChartForResponses }]
  )

  const title = await bot.nextResponse()
  t.is(title.channel, user.channel)
  t.regex(title.text, /Lunch options/)
  t.regex(title.text, /the description/)
  t.regex(title.text, /responses: 2/)

  const question1 = await bot.nextResponse()
  t.regex(question1.text, /Question 1/)
  t.regex(question1.text, /Do you like spicy food\?/)
  t.regex(question1.text, /1.*Yes.*\*\*0\*\*/)
  t.regex(question1.text, /2.*No.*\*\*2\*\*/)
  t.regex(question1.text, /3.*Only if.*\*\*0*\*/)

  const question1Image = await bot.nextResponse()
  t.deepEqual(question1Image.files, [mockQuestion1Image])

  const question2 = await bot.nextResponse()
  t.regex(question2.text, /Question 2/)
  t.regex(question2.text, /dietary restrictions/)
  // split and join because regex's don't work well over multiple lines
  t.regex(question2.text.split('\n').join(), /> None.*Mike/)
  t.regex(question2.text.split('\n').join(), />.*Kosher.*Bob/)
})
