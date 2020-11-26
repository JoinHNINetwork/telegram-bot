const TelegramBot = require('node-telegram-bot-api');
const _ = require('underscore');
const config = require('./config')
const settings = require('./settings').settings
var sqlite = require('sqlite-sync'); //requiring
var tgBot = require('./tgBotLib'); //requiring
const util = require('util')


var token = config.token;


// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const img_url = settings.logo;



//Setup the database, if table do nost exosts
tgBot.setupTable('telegrambot');




//When new user join the chat 
bot.on('new_chat_members', (msg) => {

  

  //tgBot.sendRules(msg, bot);
  //tgBot.upsertUser(msg.from.id, msg.from.username, msg.from.first_name);
});

//Record the inviter
//@todo combaing next 2 functions into one 
bot.onText(/\/start(.+)/, (msg, match) => { // (.+)
  var tg_user_id = tgBot.getReferralCode(msg, match);
  if(tg_user_id) {
    tgBot.upsertUser(msg.from.id, msg.from.username, msg.from.first_name, "", "", "", "", tg_user_id);
    tgBot.commandParser(msg, match, bot);  
  }
  else {
    tgBot.upsertUser(msg.from.id, msg.from.username, msg.from.first_name);
  }
  
})

//on just with start 
bot.onText(/\/start/, (msg, match) => { // (.+)
  var text = msg.text.trim().substring(6).trim();
  if(!text) {
    console.log("/start");
    tgBot.upsertUser(msg.from.id, msg.from.username, msg.from.first_name);
    tgBot.commandParser(msg, match, bot);  
  }
})

bot.on('message', (msg) => {
  if(!msg.text.startsWith("/start")) {
    console.log("msg, msg, msg");
    tgBot.upsertUser(msg.from.id, msg.from.username, msg.from.first_name);
    var _quest = tgBot.taskRepeater(msg, bot);
  } 
}) 

//When Error
bot.on("polling_error", (err) => tgBot.tgDebug(err));

// Listener (handler) for callback data from /label command
bot.on('callback_query', (msg) => {
  console.log("cbq", msg);
  var buttonSaveStatus = tgBot.buttonDataSave(msg);
  var msgNew = tgBot.cleanupMarkupReplyMsg(msg);  
  tgBot.askNextQuestion(msgNew, bot);

});

 
//answerInlineQuery
//exportChatInviteLink
//onReplyToMessage
//getChatMembersCount
//http://t.me/FontCommunityBot?start=234234