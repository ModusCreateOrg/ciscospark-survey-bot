import { AsyncRouter } from 'express-async-router'
import groupBy from 'lodash/groupBy'
import streamToArray from 'stream-to-array'

import Actions from './Actions'
import surveyAsCSV from './surveyAsCSV'
import surveyAsJSON from './surveyAsJSON'

const router = AsyncRouter()

import renderChart from './renderChart'

// Needs to be async because we are using AsyncRouter
const ensureLoggedIn = loginPath => async (req, res, next) => {
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
    res.render('new')
  })

  router.get('/surveys/:id/edit', async (req, res) => {
    res.locals.survey = await req.actions.getSurvey(req.params.id)
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

  router.get('/rooms', async (req, res) => {
    res.json(await req.actions.listRooms())
  })

  router.post('/surveys/:id/share', async (req, res) => {
    await req.actions.shareResults(await renderSurveyAsJSON(req), req.body.roomId)
    res.json({ result: 'success' })
  })

  // TODO: should only be available in dev/test mode
  router.get('/surveys/:id/chart/:questionIdx.png', async (req, res) => {
    const survey = await renderSurveyAsJSON(req)
    const responses = survey.questions[req.params.questionIdx].responsesByChoice

    const stream = await renderChart(responses)
    const [buffer] = await streamToArray(stream)

    res.writeHead(200, { 'Content-Type': 'image/png' })
    res.write(buffer, 'binary')
    res.end(null, 'binary')
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
