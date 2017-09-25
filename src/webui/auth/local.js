import express from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import uuid from 'uuid/v4'

const imageUrlForEmoji = (emoji) => `data:image/svg+xml;utf8,
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <text x="0" y="90" font-size="100">
      ${emoji}
    </text>
  </svg>
`

passport.use(new LocalStrategy({
  passReqToCallback: true
},
  (req, username, password, done) => {
    done(null, {
      isLocal: true,
      profile: {
        displayName: username,
        emails: [req.body.email],
        id: uuid(),
        avatar: imageUrlForEmoji('😃')
      }
    })
  }))

export const router = express.Router()

router.post('/', passport.authenticate('local'), (req, res) => res.redirect('/'))
