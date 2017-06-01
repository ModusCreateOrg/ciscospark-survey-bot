import express from 'express'
import bodyParser from 'body-parser'

import actions from './actions'

const router = express.Router()

export default (app, spark, store, bot) => {
  app.use(bodyParser.urlencoded())
  app.set('views', 'src/templates')
  app.set('view engine', 'pug')
  app.use('/static', express.static('public'))

  router.get('/', (req, res) => {
    actions.listUsers().then( (users) => {
      res.render('index', { users })
    }).catch(console.error)
  })

  app.use('/', router)
}
