import test from 'ava'
import sinon from 'sinon'

import setupBot from '../helpers/setupBot'
import calledAsync from '../helpers/calledAsync'

test.beforeEach(setupBot)

test('sharing survey results results with a space', async t => {
  const { controller } = t.context

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
    surveyTakers: {
      'mike@promptworks.com': { name: 'Mike Nicholaides' },
      'bob@promptworks.com': { name: 'Bob Barker' }
    }
  }

  const renderChartForResponses = sinon.stub()
  const mockQuestion1Image = { the: 'image' }
  renderChartForResponses.resolves(mockQuestion1Image)

  const postMessages = sinon.stub()

  controller.trigger(
    'share_results',
    [{ surveyAsJSON, postMessages, renderChartForResponses }]
  )

  // We can't `await controller.trigger` because it doesn't pass on the return values of the functions it triggers.
  await calledAsync(postMessages)

  t.true(postMessages.calledOnce)
  const [title, question1, question1Image, question2, ...rest] = postMessages.firstCall.args[0]

  t.regex(title.markdown, /Lunch options/)
  t.regex(title.markdown, /the description/)
  t.regex(title.markdown, /responses: 2/)

  t.regex(question1.markdown, /Question 1/)
  t.regex(question1.markdown, /Do you like spicy food\?/)
  t.regex(question1.markdown, /1.*Yes.*\*\*0\*\*/)
  t.regex(question1.markdown, /2.*No.*\*\*2\*\*/)
  t.regex(question1.markdown, /3.*Only if.*\*\*0*\*/)

  t.deepEqual(question1Image.files, [mockQuestion1Image])

  t.regex(question2.markdown, /Question 2/)
  t.regex(question2.markdown, /dietary restrictions/)
  // split and join because regex's don't work well over multiple lines
  t.regex(question2.markdown.split('\n').join(), /> None.*Mike/)
  t.regex(question2.markdown.split('\n').join(), />.*Kosher.*Bob/)

  t.deepEqual(rest, [])
})
