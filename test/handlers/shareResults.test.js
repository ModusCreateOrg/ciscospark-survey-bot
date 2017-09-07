import test from 'ava'
import sinon from 'sinon'
import setupBot from '../helpers/setupBot'

test.beforeEach(setupBot)
test.beforeEach(({ context }) => { context.user = context.bot.createUser() })

test('sharing survey results results with a space', async t => {
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
