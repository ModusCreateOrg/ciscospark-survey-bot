import bodyParser from 'body-parser'
import cookieSession from 'cookie-session'
import express from 'express'
import passport from 'passport'

import {
  ensureLoggedIn,
  router as authRouter,
} from './auth'

import actions from './actions'


export default (app) => {
  app.set('views', 'src/templates')
  app.set('view engine', 'pug')
  app.use('/bower', express.static('bower_components'))
  app.use('/static', express.static('public'))

  app.use(bodyParser.urlencoded())
  app.use(cookieSession({
    name: 'session',
    keys: ['my secret key'], // TODO: put in .env.local
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  app.use('/auth/', authRouter)

  app.get('/', ensureLoggedIn('/auth/login'), async (req, res) => {
    try {
      const users = await actions.listUsers()
      res.render('index', { users })
    } catch (e) { console.error(e) }
  })
}
