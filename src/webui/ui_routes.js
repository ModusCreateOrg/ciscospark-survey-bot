import { AsyncRouter } from 'express-async-router'
import groupBy from 'lodash/groupBy'
import Actions from './Actions'
import surveyAsCSV from './surveyAsCSV'
import surveyAsJSON from './surveyAsJSON'

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
