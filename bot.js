require('dotenv').config()

process.on('SIGINT', process.exit)

if (!process.env.SLACK_API_TOKEN) {
  console.error('Error: SLACK_API_TOKEN is not specified')
  process.exit(1)
}

const Botkit = require('botkit')
const async = require('async')

const controller = Botkit.slackbot({})

const checkError = (err) => {
  if (!err) return

  console.error(err)
  process.exit(1)
}

let botname = 'stamp'

const rtm = controller.spawn({
  token: process.env.SLACK_API_TOKEN
}).startRTM((err, bot) => {
  checkError(err)
  botname = bot.identity.name
})

controller.setupWebserver(process.env.PORT, (err, webserver) => {
  checkError(err)
  controller.createWebhookEndpoints(webserver)
})

controller.on('slash_command', (bot, message) => {
  async.parallel({
    user: rtm.api.users.info.bind(null, { user: message.user_id }),
    emoji: rtm.api.emoji.list.bind(null, {})
  }, (err, res) => {
    if (err) return bot.replyPrivate(message, err)

    const profile = res.user.user.profile || {}
    const emoji = res.emoji.emoji || {}

    const attachments = message.text.match(/:[^:]+:/g)
      .map(s => emoji[s.replace(/:/g, '')])
      .filter(url => url)
      .map(url => ({
        color: '#fff',
        text: '',
        image_url: url
      }))

    if (attachments.length === 0) return bot.replyPrivate(message, 'Error: Typed emoji was not found.')

    const reply = {
      channel: message.channel,
      username: profile.real_name,
      icon_url: profile.image_72,
      attachments: attachments
    }

    rtm.send(reply, function (err, res) {
      if (err === 'channel_not_found') return bot.replyPrivate(message, 'Error: This channel is private. Please run command `/invite @' + botname + '`.')
      if (err) return bot.replyPrivate(message, err)

      bot.replyAcknowledge()
    })
  })
})
