import test from 'ava'
import setupBot from '../helpers/setupBot'

test.beforeEach(setupBot)

test('bot gives a survey', async t => {
  const { bot, controller } = t.context

  // const user = bot.createUser(userId, roomId)

  const survey = {
    id: 'foo',
    data: {
      questions: [{ text: 'things', type: 'text' }]
    }
  }
  const roomId = 'My room'
  const personEmail = 'Randy@Butter.nubs'
  const recordAnswer =  () => null

  controller.trigger('survey_started', [bot, { survey, roomId, personEmail, recordAnswer }])

  const firstQuestion = await bot.nextResponse()
  t.is(firstQuestion.text, 'things')

  // user.says('foos')
  bot.userReplies(personEmail, roomId, 'foos')

  const next = await bot.nextResponse()
  t.is(next.text, 'Thanks for your responses!')
})
