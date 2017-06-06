import express from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'

const imageUrlForEmoji = (emoji) => `data:image/svg+xml;utf8,
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <text x="0" y="90" font-size="100">
      ${emoji}
    </text>
  </svg>
`

passport.use(new LocalStrategy((username, password, done) => {
  done(null, {
    profile: {
      displayName: username,
      avatar: imageUrlForEmoji('😃'),
    },
  })
}))


export const router = express.Router()

router.post('/', passport.authenticate('local'), (req, res) => {
  console.error('ARRIVED /auth/local')
  res.redirect('/')
})
