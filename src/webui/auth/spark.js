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
  scope: [
    'spark:rooms_read',       // required by SparkUser for letting you choose a room to survey
    'spark:memberships_read', // required by SparkUser for knowing who is in a room
    'spark:people_read',      // required by passport for fetching user info (name, avatar, etc...)
  ]
}))

router.get('/callback', passport.authenticate('cisco-spark', {
  successRedirect: '/',
  failureRedirect: '/auth/login'
}))
