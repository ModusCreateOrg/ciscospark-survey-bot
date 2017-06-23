import { AsyncRouter } from 'express-async-router'
import partition from 'lodash/partition'
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

router.use(ensureLoggedIn('/auth/login'))

router.use(async (req, res, next) => {
  req.actions = new Actions(req.user)
  next()
})

router.get('/', async (req, res) => {
  const [activeSurveys, draftSurveys] = partition(await req.actions.listSurveys(), 'isActive')
  res.locals.activeSurveys = activeSurveys
  res.locals.draftSurveys = draftSurveys
  res.render('index')
})

router.get('/surveys/new', async (req, res) => {
  res.locals.rooms = await req.actions.listRooms()
  res.render('new')
})

router.get('/surveys/:id', async (req, res) => {
  [ res.locals.rooms, res.locals.survey ] = await Promise.all([
    req.actions.listRooms(),
    req.actions.getSurvey(req.params.id),
  ])
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

export default router
