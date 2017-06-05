import express from 'express'
import bodyParser from 'body-parser'
import cookieSession from 'cookie-session'
import urlJoin from 'url-join'

import passport from 'passport'
import { OAuth2Strategy } from 'passport-oauth'
import CiscoSparkStrategy from 'passport-cisco-spark'

import actions from './actions'

const sparkOauthConfig = {
  clientID: process.env.SPARK_OAUTH__CLIENT_ID,
  clientSecret: process.env.SPARK_OAUTH__CLIENT_SECRET,
  callbackURL: urlJoin(process.env.PUBLIC_ADDRESS, 'auth/spark/callback'),
}

passport.use(new CiscoSparkStrategy(sparkOauthConfig, (accessToken, refreshToken, profile, done) => {
  // User.findOrCreate({ sparkId: profile.id }, function (err, user) {
  //   return done(err, user);
  // });
  done(null, { accessToken, refreshToken, profile })
}))


passport.serializeUser((user, done) => {
  const serialized = JSON.stringify(user)
  done(null, serialized)
})

passport.deserializeUser((user, done) => {
  try {
    const deserialized = JSON.parse(user)
    done(null, deserialized)
  } catch (e) {
    done(e)
  }
})


const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const users = await actions.listUsers()
    const me = req.user
    res.render('index', { users, me })
  } catch (e) { console.error(e) }
})


const sparkOAuthRouter = express.Router()

sparkOAuthRouter.get('/', passport.authenticate('cisco-spark', {
  scope: ['spark:all'],
}))
sparkOAuthRouter.get('/callback', passport.authenticate('cisco-spark', {
  successRedirect: '/',
  failureRedirect: '/login',
}))


export default (app) => {
  app.set('views', 'src/templates')
  app.set('view engine', 'pug')
  app.use('/static', express.static('public'))

  app.use(bodyParser.urlencoded())
  app.use(cookieSession({
    name: 'session',
    keys: ['my secret key'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use('/', router)
  app.use('/auth/spark', sparkOAuthRouter)
}
