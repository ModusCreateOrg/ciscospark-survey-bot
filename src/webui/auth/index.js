import express from 'express'
import passport from 'passport'

import { router as localRouter } from './local'
import { router as sparkRouter } from './spark'


passport.serializeUser((user, done) => {
  done(null, JSON.stringify(user))
})

passport.deserializeUser((user, done) => {
  try {
    done(null, JSON.parse(user))
  } catch (e) {
    done(e)
  }
})


export const ensureLoggedIn = (loginPath) => (req, res, next) => {
  if (!req.user) {
    res.redirect(loginPath)
  } else {
    res.locals.currentUser = req.user
  }
  next()
}


export const router = express.Router()

router.use('/spark', sparkRouter)

router.use('/local', localRouter) // TODO: make this only happen in dev

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('login')
})

router.get('/login', (req, res) => {
  res.render('login')
})
