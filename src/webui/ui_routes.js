import { AsyncRouter } from 'express-async-router'
import groupBy from 'lodash/groupBy'

import Actions from './Actions'
import surveyAsCSV from './surveyAsCSV'
import surveyAsJSON from './surveyAsJSON'

import { Readable } from 'stream'
import escapeHTML from 'escape-html'
import phantom from 'phantom-render-stream'
import stringStream from 'string-to-stream'
import Jimp from 'jimp'
import streamToArray from 'stream-to-array'
import isBuffer from 'lodash'
import promisify from 'promisify-node'

const router = AsyncRouter()

// Needs to be async because we are using AsyncRouter
const ensureLoggedIn = (loginPath) => async (req, res, next) => {
  if (!req.user) {
    res.redirect(loginPath)
    res.end()
  } else {
    res.locals.currentUser = req.user
    next()
  }
}

export default (controller, bot, io) => {
  io.on('connection', (socket) => {
    socket.on('subscribe:survey', (token) => {
      console.log('EVENT subscribe:survey', token)
      socket.join(token)
    })
  })

  router.use(ensureLoggedIn('/auth/login'))

  router.use(async (req, res, next) => {
    req.actions = new Actions(req.user, controller, bot, io)
    next()
  })

  router.get('/', async (req, res) => {
    res.locals.surveys = groupBy(await req.actions.listSurveys(), 'state')
    res.render('index')
  })

  router.get('/surveys/new', async (req, res) => {
    res.locals.rooms = await req.actions.listRooms()
    res.render('new')
  })

  router.get('/surveys/:id/edit', async (req, res) => {
    [ res.locals.rooms, res.locals.survey ] = await Promise.all([
      req.actions.listRooms(),
      req.actions.getSurvey(req.params.id)
    ])
    res.render('edit')
  })

  const withDownloadHeaders = contentType => async (req, res, next) => {
    if (req.query.download) {
      res.header('Content-Disposition', `attachment`)
      if (contentType) {
        res.header('Content-Type', contentType)
      }
    }

    next()
  }

  const renderSurveyAsJSON = ({actions, params: { id }}) =>
    actions.getSurveyAndAllResponses(id).then(surveyAsJSON)

  router.get('/surveys/:id/:title.json', withDownloadHeaders(), async (req, res) => {
    res.json(await renderSurveyAsJSON(req))
  })

  router.get('/surveys/:id/:title.csv', withDownloadHeaders('text/csv'), async (req, res) => {
    res.send(await surveyAsCSV(await renderSurveyAsJSON(req)))
  })

  router.get('/surveys/:id', async (req, res) => {
    res.locals.survey = await req.actions.getSurvey(req.params.id)
    res.render('show')
  })

  const renderPhantom = phantom()

  router.get('/surveys/:id/chart/:questionIdx.png', async (req, res) => {
    const survey = await renderSurveyAsJSON(req)
    const responses = survey.questions[req.params.questionIdx].responsesByChoice

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

    const parts = await streamToArray(stream)
    const buffer = Buffer.concat(parts.map(part => isBuffer(part) ? part : Buffer.from(part)))

    let image = await Jimp.read(buffer)
    const autocropped = image.clone().autocrop()
    const { width: wCropped, height: hCropped } = autocropped.bitmap
    const wOrig = image.bitmap.width

    const lrBorder = 20
    const bottomBorder = 30
    image = image.crop(
      (wOrig - wCropped) / 2 - lrBorder,
      0,
      wCropped + lrBorder * 2,
      hCropped + bottomBorder,
    )

    const croppedBuffer = await promisify(image.getBuffer).call(image, 'image/bmp')

    res.writeHead(200, { 'Content-Type': 'image/png' })

    res.write(croppedBuffer,'binary');
    res.end(null, 'binary');
  })

  router.post('/surveys', async (req, res) => {
    const survey = await req.actions.createSurvey(req.body)
    res.json(survey)
  })

  router.put('/surveys/:id', async (req, res) => {
    const survey = await req.actions.updateSurvey(req.params.id, { data: req.body })
    res.json(survey)
  })

  router.post('/surveys/:id/conduct', async (req, res) => {
    const survey = await req.actions.conductSurvey(req.params.id)
    res.json(survey)
  })

  return router
}
