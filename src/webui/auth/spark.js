import express from 'express'
import passport from 'passport'
import CiscoSparkStrategy from 'passport-cisco-spark'
import urlJoin from 'url-join'

const sparkOauthConfig = {
  clientID: process.env.SPARK_OAUTH__CLIENT_ID,
  clientSecret: process.env.SPARK_OAUTH__CLIENT_SECRET,
  callbackURL: urlJoin(process.env.PUBLIC_ADDRESS, 'auth/spark/callback')
}

export const router = express.Router()

passport.use(new CiscoSparkStrategy(sparkOauthConfig, (accessToken, refreshToken, profile, done) => {
  done(null, { accessToken, refreshToken, profile })
}))

router.get('/', passport.authenticate('cisco-spark', {
  scope: ['spark:all']
}))

router.get('/callback', passport.authenticate('cisco-spark', {
  successRedirect: '/',
  failureRedirect: '/auth/login'
}))
