import test from 'ava'

export default (title, testBody, ...examples) => {
  for (const [inputs, outputs] of examples) {
    test(`${title}: ${JSON.stringify(inputs)} => ${JSON.stringify(outputs)}`, t =>
      testBody(t, inputs, outputs)
    )
  }
}

