import { AsyncRouter } from 'express-async-router'
import actions from './actions'

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

router.get('/', async (req, res) => {
  res.locals.surveys = await actions.listSurveys(req.user)
  res.render('index')
})

router.get('/surveys/new', async (req, res) => {
  res.locals.rooms = await actions.listRooms(req.user)
  res.render('new')
})

router.get('/surveys/:id', async (req, res) => {
  res.locals.rooms = await actions.listRooms(req.user)
  res.locals.survey = await actions.getSurvey(req.user, req.params.id)
  res.render('show')
})

router.post('/surveys', async (req, res) => {
  const survey = await actions.createSurvey(req.user, req.body)
  res.json(survey)
})

router.put('/surveys/:id', async (req, res) => {
  const survey = await actions.updateSurvey(req.user, req.params.id, req.body)
  res.json(survey)
})

export default router
