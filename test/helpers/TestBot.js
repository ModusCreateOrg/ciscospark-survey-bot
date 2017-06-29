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
      bot.responses = new AsyncQueue({ timeout })
      testBotkit.startTicking()
    }

    bot.createConversation = (message, cb) => {
      botkit.createConversation(bot, message, cb)
    }

    bot.startConversation = (message, cb) => {
      botkit.startConversation(bot, message, cb)
    }

    bot.send = (message, cb) => {
      bot.responses.enqueue(message)

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
      testBotkit.receiveMessage(bot, message)
    }

    bot.userReplies = (user, channel, text) => {
      testBotkit.receiveMessage(bot, { user, channel, text })
    }

    bot.nextResponse = () => bot.responses.dequeue()

    bot.findConversation = (message, cb) => {
      console.log('CUSTOM FIND CONVO', message)
      for (const task of botkit.tasks) {
        for (const convo of task.convos) {
          if (
            convo.isActive() &&
            convo.source_message.user === message.user &&
            convo.source_message.channel === message.channel
          ) {
            botkit.debug('FOUND EXISTING CONVO!')
            cb(convo)
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
