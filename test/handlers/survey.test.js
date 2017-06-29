import test from 'ava'
import setupBot from '../helpers/setupBot'

test.beforeEach(setupBot)

test('bot gives a survey', async t => {
  const { bot, controller } = t.context

  const survey = {
    id: 'foo',
    data: {
      questions: [{ text: 'things' }]
    }
  }
  const roomId = 'Randy'
  const personEmail = 'Plant'
  const recordAnswer =  () => null

  controller.trigger('survey_started', { survey, roomId, personEmail, recordAnswer })

  const firstQuestion = await bot.nextResponse()
  t.is(firstQuestion, 'things')
})
