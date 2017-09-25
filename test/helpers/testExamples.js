import test from 'ava'

import zip from 'lodash/zip'
import flatten from 'lodash/flatten'

export default (title, testBody, ...examples) => {
  for (const [inputs, outputs] of examples) {
    test(`${title}: ${JSON.stringify(inputs)} => ${JSON.stringify(outputs)}`, t =>
      testBody(t, inputs, outputs)
    )
  }
}

