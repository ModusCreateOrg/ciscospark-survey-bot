import { AsyncRouter } from 'express-async-router'
import groupBy from 'lodash/groupBy'
import Actions from './Actions'

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

export default (controller, bot) => {
  router.use(ensureLoggedIn('/auth/login'))

  router.use(async (req, res, next) => {
    req.actions = new Actions(req.user, controller, bot)
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
