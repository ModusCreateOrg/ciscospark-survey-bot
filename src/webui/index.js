import bodyParser from 'body-parser'
import cookieSession from 'cookie-session'
import express from 'express'
import morgan from 'morgan'
import passport from 'passport'

import authRouter from './auth'
import uiRouter from './ui_routes'

import SocketIO from 'socket.io'

export default (app, controller, bot) => {
  app.set('views', 'src/templates')
  app.set('view engine', 'pug')
  app.use('/bower', express.static('bower_components'))
  app.use('/static', express.static('public'))

  app.use(bodyParser.urlencoded())
  app.use(cookieSession({
    name: 'session',
    keys: [controller.config.secret],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  app.use(morgan('dev'))

  app.use('/auth/', authRouter)

  app.use('/', uiRouter(controller, bot, SocketIO(controller.httpserver)))
}
