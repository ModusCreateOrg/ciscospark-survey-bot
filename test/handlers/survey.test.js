import test from 'ava'
import setupBot from '../helpers/setupBot'

test.beforeEach(setupBot)
test.beforeEach(({ context }) => { context.user = context.bot.createUser() })

test('bot gives a survey', async t => {
  const { bot, controller, user } = t.context

  const survey = {
    id: 'foo',
    data: {
      questions: [{ text: 'things', type: 'text', id: 1 }]
    }
  }
  const recordAnswer = (...args) => console.log('submitted survey', args)

  controller.trigger(
    'survey_started',
    [bot, { survey, roomId: user.channel, personEmail: user.id, recordAnswer }]
  )

  const firstQuestion = await bot.nextResponse()
  t.is(firstQuestion.text, 'things')
  t.is(firstQuestion.channel, user.channel)

  user.says('foos')

  const next = await bot.nextResponse()
  t.is(next.text, 'Thanks for your responses!')
})
