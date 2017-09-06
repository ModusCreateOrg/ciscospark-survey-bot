import Jimp from 'jimp'
import escapeHTML from 'escape-html'
import isBuffer from 'lodash'
import phantom from 'phantom-render-stream'
import promisify from 'promisify-node'
import streamToArray from 'stream-to-array'
import stringStream from 'string-to-stream'
import tmp from 'tmp'
import { Readable } from 'stream'
import fs from 'fs'

promisify(tmp)

export const bufferSourcedStream = buffer => {
  const readable = new Readable()
  readable.push(buffer)
  readable.push(null)
  return readable
}

export default async responses => {
  const renderPhantom = phantom()

  const scripts = [
    'bower_components/vue/dist/vue.min.js',
    'bower_components/chart.js/dist/Chart.bundle.min.js',
    'bower_components/chartkick/chartkick.js',
    'bower_components/vue-chartkick/dist/vue-chartkick.min.js'
  ]

  const html = `
    <body style='background: white'>
    <div id=chart>
      <pie-chart :data="${escapeHTML(JSON.stringify(responses))}" legend=bottom donut></pie-chart>
    </div>
    <script>new Vue({el: '#chart'})</script>
    </body>
  `

  const stream = stringStream(html).pipe(renderPhantom({
    injectJs: scripts,
    width: 700,
    height: 500,
  }))

  const buffer = Buffer.concat(await streamToArray(stream))

  let image = await Jimp.read(buffer)
  const autocropped = image.clone().autocrop()
  const { width: wCropped, height: hCropped } = autocropped.bitmap
  const wOrig = image.bitmap.width

  const lrBorder = 20
  const bottomBorder = 30

  const tmpFilePath = (await tmp.tmpName()) + '.png'

  image = image.crop(
    (wOrig - wCropped) / 2 - lrBorder,
    0,
    wCropped + lrBorder * 2,
    hCropped + bottomBorder,
  )

  await promisify(image.write).call(image, tmpFilePath) // TODO: remove this file up after everything is done?

  return fs.createReadStream(tmpFilePath)
}
