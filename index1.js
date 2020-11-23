const TelegramBot = require('node-telegram-bot-api');
const _ = require('underscore');
const config = require('./config')
const settings = require('./settings').settings
var sqlite = require('sqlite-sync'); //requiring
var tgBot = require('./tgBotLib'); //requiring


var token = config.token;


// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const img_url = settings.logo;



//Setup the database, if table do nost exosts
tgBot.setupTable('telegrambot');




//When new user join the chat 
bot.on('new_chat_members', (msg) => {

  console.log("msg from new_chat_members", msg); 

  //tgBot.sendRules(msg, bot);
  //tgBot.upsertUser(msg.from.id, msg.from.username, msg.from.first_name);
});

//Record the inviter
bot.onText(/\/start(.+)/, (msg, match) => { // (.+)
  var tg_user_id = parseInt(msg.text.trim().substring(6).trim());
  if(tg_user_id) {
    console.log("msg from onText 1, only executs where there is referral id", msg);
    tgBot.upsertUser(msg.from.id, msg.from.username, msg.from.first_name, "", "", "", "", tg_user_id);
    tgBot.commandParser(msg, match, bot);  
  }
  else {

  }
})

//on just with start 
bot.onText(/\/start/, (msg, match) => { // (.+)
  var text = msg.text.trim().substring(6).trim();
  if(!text) {
    console.log("msg from onText 2, only if /start without any extra data", msg);
    tgBot.commandParser(msg, match, bot);  
  }
})

bot.on('message', (msg) => {

  if(!msg.text.startsWith("/start")) {
    tgBot.upsertUser(msg.from.id, msg.from.username, msg.from.first_name);
    var _quest = tgBot.questionRepeater(msg, bot);
  }

  /*
  var tg_user_id = parseInt(msg.text.trim().substring(6).trim());
  if(!tg_user_id) {
    console.log("msg from message, executs only when not start with referral number", msg);
    
    //
  }
  */
}) 

//When Error
bot.on("polling_error", (err) => tgBot.tgDebug(err));

// Listener (handler) for callback data from /label command
bot.on('callback_query', (msg) => {
   //console.log("msg from callback", msg);
   const message = msg.message;
   
   //Callback query have different format, fix it
   let _msg_updated = JSON.parse(JSON.stringify(message));

   _msg_updated.from = msg.from;
   delete _msg_updated.reply_markup;
   //console.log("msg from callback modifed", _msg_updated);

   const answer = msg.data; 
   var _option_question = msg.message.reply_markup.inline_keyboard[0][0].text;
   //@todo get this stuff from settings 
   console.log("cbq 1");
   switch(_option_question) {
     case 'Done Step 1':
       if(answer === '1') {
         tgBot.updateUserField(_msg_updated.from.id, 'sts_twitter_follow', 1);
         tgBot.questionRepeater(_msg_updated, bot, true);

       }
     break;
   } 
});

 
//answerInlineQuery
//exportChatInviteLink
//onReplyToMessage
//getChatMembersCount
//http://t.me/FontCommunityBot?start=234234