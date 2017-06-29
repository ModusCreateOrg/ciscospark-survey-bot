import Botkit from 'botkit'
import AsyncQueue from './AsyncQueue'

export default (configuration = {}) => {
  const { timeout = 5000, ...coreConfig } = configuration
  const testBotkit = Botkit.core(coreConfig)

  testBotkit.middleware.spawn.use((bot, next) => {
    bot.initialize()
    next()
  })


  // this needs the "function" cruft to be a "constructor function" :(
  testBotkit.defineBot(function (botkit, config) {
    const bot = {
      botkit: botkit,
      config: config || {},
      utterances: botkit.utterances
    }

    bot.initialize = () => {
      this.responses = new AsyncQueue({ timeout })
    }

    bot.createConversation = (message, cb) => {
      botkit.createConversation(this, message, cb)
    }

    bot.startConversation = (message, cb) => {
      botkit.startConversation(this, message, cb)
    }

    bot.send = (message, cb) => {
      this.responses.enqueue(message)

      console.log('BOT.send:', message.text)
      if (cb) {
        cb()
      }
    }

    bot.reply = (src, resp, cb) => {
      let msg = {}

      if (typeof (resp) === 'string') {
        msg.text = resp
      } else {
        msg = resp
      }

      msg.channel = src.channel

      bot.say(msg, cb)
    }

    bot.userSays = (text) => {
      const message = {
        text,
        user: 'user',
        channel: 'text',
        timestamp: Date.now()
      }
      testBotkit.receiveMessage(this, message)
    }

    bot.nextResponse = () => this.responses.dequeue()

    bot.findConversation = (message, cb) => {
      botkit.debug('CUSTOM FIND CONVO', message.user, message.channel)
      for (var t = 0; t < botkit.tasks.length; t++) {
        for (var c = 0; c < botkit.tasks[t].convos.length; c++) {
          if (
              botkit.tasks[t].convos[c].isActive() &&
              botkit.tasks[t].convos[c].source_message.user == message.user
            ) {
            botkit.debug('FOUND EXISTING CONVO!')
            cb(botkit.tasks[t].convos[c])
            return
          }
        }
      }

      cb()
    }

    return bot
  })

  return testBotkit
}
