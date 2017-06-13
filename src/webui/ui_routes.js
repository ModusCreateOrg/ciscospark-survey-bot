import { AsyncRouter } from 'express-async-router'
import Actions from './actions'

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

const all = function () { return Promise.all(arguments) }


router.use(ensureLoggedIn('/auth/login'))

router.use(async (req, res, next) => {
  req.actions = new Actions(req.user)
  next()
})

router.get('/', async (req, res) => {
  res.locals.surveys = await req.actions.listSurveys()
  res.render('index')
})

router.get('/surveys/new', async (req, res) => {
  res.locals.rooms = await req.actions.listRooms()
  res.render('new')
})

router.get('/surveys/:id', async (req, res) => {
  // assignAsync(req.locals, {
  //   rooms: req.actions.listRooms(),
  //   survey: req.actions.getSurvey(req.params.id),
  // })

  [ res.locals.rooms, res.locals.survey ] = await all(
    req.actions.listRooms(),
    req.actions.getSurvey(req.params.id),
  )
  res.render('show')
})

router.post('/surveys', async (req, res) => {
  const survey = await req.actions.createSurvey(req.body)
  res.json(survey)
})

router.put('/surveys/:id', async (req, res) => {
  const survey = await req.actions.updateSurvey(req.params.id, req.body)
  res.json(survey)
})

export default router
