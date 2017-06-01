import express from 'express'
import bodyParser from 'body-parser'

const router = express.Router()

export default (app, spark, store, bot) => {
  console.error('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
  app.use(bodyParser.urlencoded())
  app.set('views', 'src/templates')
  app.set('view engine', 'pug')
  app.use('/static', express.static('public'))

  router.get('/', (req, res) => {
    const users = [{name: 'bob'}, {name: 'alice'}]
    res.render('index', { users })
  })

  app.use('/', router)
}
