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
  const surveys = await actions.listSurveys()
  res.render('index', { surveys })
})

router.post('/surveys', async (req, res) => {
  const survey = await actions.createSurvey(req.user, req.body)
  res.json(survey)
})

export default router
