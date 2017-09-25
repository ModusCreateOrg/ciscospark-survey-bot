import express from 'express'
import passport from 'passport'
import * as env from '../../env'

import { router as localRouter } from './local'
import { router as sparkRouter } from './spark'
import { parseDomainList, emailsAreWithinDomains } from './helpers'

passport.serializeUser((user, done) => {
  const allowedDomains = parseDomainList(process.env.RESTRICT_LOGINS_TO_DOMAINS)

  if (emailsAreWithinDomains(user.profile.emails, allowedDomains)) {
    done(null, JSON.stringify(user))
  } else {
    done(`Login email address must be in one of these domains: ${JSON.stringify(allowedDomains)}`)
  }
})

passport.deserializeUser((user, done) => {
  try {
    done(null, JSON.parse(user))
  } catch (e) {
    done(e)
  }
})

const router = express.Router()

router.use((req, res, next) => {
  res.locals.env = env
  next()
})

router.use('/spark', sparkRouter)

if (env.allowDevLogin) {
  router.use('/local', localRouter)
}

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('login')
})

router.get('/login', (req, res) => {
  res.render('login')
})

export default router
