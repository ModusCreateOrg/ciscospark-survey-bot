import test from 'ava'
import fileType from 'file-type'
import streamToArray from 'stream-to-array'

import renderChart from '../../src/webui/renderChart'

test('renderChart renders a PNG', async t => {
  const stream = await renderChart([["Yes", 5], ["No", 2], ["Maybe", 3]])
  const [buffer, ...rest] = await streamToArray(stream)
  t.deepEqual(rest, [])

  t.deepEqual('image/png', fileType(buffer).mime)
})
