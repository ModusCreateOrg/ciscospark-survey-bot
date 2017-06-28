import test from 'ava'
import TestBot from '../testBot'

test('bot gives a survey', async t => {
  const controller = TestBot({ timeout: 100 })
  const bot = controller.spawn()

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
