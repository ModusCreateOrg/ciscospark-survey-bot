import Jimp from 'jimp'
import fs from 'fs'
import isBuffer from 'lodash'
import phantom from 'phantom-render-stream'
import promisify from 'promisify-node'
import streamToArray from 'stream-to-array'
import stringToStream from 'string-to-stream'
import tmp from 'tmp'

promisify(tmp)

const render = responses => {
  const renderPhantom = phantom()

  const scripts = [
    'bower_components/chart.js/dist/Chart.bundle.min.js',
    'bower_components/chartkick/chartkick.js',
  ]

  const html = `
    <body style='background: white'>
      <script>
        window.onload = function () {
          new Chartkick.PieChart(
            'chart',
            ${JSON.stringify(responses)},
            { donut: true, legend: 'bottom' }
          )
        }
      </script>

      <div id=chart></div>
    </body>
  `

  return stringToStream(html).pipe(renderPhantom({
    injectJs: scripts,
    width: 700,
    height: 500,
  }))
}

const streamToBuffer = async stream => Buffer.concat(await streamToArray(stream))

const crop = async (imageBuffer, outputFilePath) => {
  const image = await Jimp.read(imageBuffer)

  const autocropped = image.clone().autocrop()
  const { width: wCropped, height: hCropped } = autocropped.bitmap
  const wOrig = image.bitmap.width

  const lrBorder = 20
  const bottomBorder = 30

  const x = (wOrig - wCropped) / 2 - lrBorder
  const y = 0
  const width = wCropped + lrBorder * 2
  const height = hCropped + bottomBorder

  image.crop(x, y, width, height)

  await promisify(image.write).call(image, outputFilePath)
}

export default async responses => {
  const buffer = await streamToBuffer(render(responses))

  const tmpFilePath = (await tmp.tmpName()) + '.png'

  await crop(buffer, tmpFilePath)

  // TODO: remove this file up after everything is done?
  return fs.createReadStream(tmpFilePath)
}
