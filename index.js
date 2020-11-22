const TelegramBot = require('node-telegram-bot-api');
const _ = require('underscore');
const config = require('./config')
const settings = require('./settings').settings
var sqlite = require('sqlite-sync'); //requiring


var token = config.token;


// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const img_url = settings.logo;



//Setup the database
setup();


//Settings 
var _opt = {
  parse_mode: 'HTML',
  disable_web_page_preview: true
}

//When new user join the chat 
bot.on('new_chat_members', (msg) => {
  sendRules(msg);
  upsertUser(msg.from.id, msg.from.username, msg.from.first_name);
});

bot.onText(/\/start(.+)/, (msg, match) => { // (.+)
  commandParser(msg, match); 
})

bot.onText(/\/start/, (msg, match) => { // (.+)
  commandParser(msg, match);
})

bot.on('message', (msg) => {
  console.log("msg from message", msg);
  upsertUser(msg.from.id, msg.from.username, msg.from.first_name);
  var _quest = questionRepeater(msg);

})

//When Error
bot.on("polling_error", (err) => tgDebug(err));

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
         updateUserField(_msg_updated.from.id, 'sts_twitter_follow', 1);
         questionRepeater(_msg_updated, true);
         //console.log("cbq 2");
         //setTimeout(function() {  }, 500);
 
         
         //console.log("cbq 3");
       }
     break;
   } 
});

 
function fixMsgFromID(msg) {

}

//Send rules when /start typed
//@todo prefill options
function sendRules(msg, prefill = false) {

  if(!msg) {
    return false;
  }

  var _tick_mark = "✅";

  var name = "<b>" + msg.from.first_name + "(" + msg.from.username + ")" + "</b>";

  var welcomeText = "Hello " + name + "\n\nWelcome to " + settings.telegramGroupName + "!\
  Join our community and refer to get upto $5000 worth of "+ settings.tokenSymbol +" tokens.\n\n";

  welcomeText = welcomeText + "<b>Your referal link : </b>" + getReferralLink(msg.from.id);

  welcomeText = welcomeText + "\n\n";

  var _data = {
    email: '',
    twitter: '',
    eth_wallet: '',
    discord: '',
  };  



  var tg_user_id = msg.from.id;
  var userData = null;
  if(tg_user_id) {
    userData = loadUser(tg_user_id);
  }

  var rules = "<b>Airdrop Rules</b>:\n";
  

  //Rule 2
  rules = rules + "\n<pre>1. Follow our Twitter, Like and Retweet the pinned tweet.</pre> \n" + settings.twitterURL + " \n";
  
  //Rule 3 get twitter ID
  var _isDone = "";
  var _answer = "";
  if(prefill && userData && userData.twitter) {
    _isDone = _tick_mark;
    _answer = "<b>: " + userData.twitter + "</b>";
  }
  rules = rules + "\n<pre>2." + _isDone + " Enter your Twitter ID " + _answer + ".</pre>";

  //Rule 4 Join the Discord Server
  rules = rules + "\n<pre>3. Join our Discord</pre> \n" + settings.discordLink + " \n";

  //Rule 5 get discord ID
  var _isDone = "";
  var _answer = "";
  if(prefill && userData && userData.discord) {
    _isDone = _tick_mark;
    _answer = "<b>: " + userData.discord + "</b>";
  }
  rules = rules + "\n<pre>4." + _isDone + " Enter your Discord Username" + _answer + ".</pre>";  

  // Rule 4 get the email id
  _isDone = "";
  _answer = "";
  if(prefill && userData && userData.email) {
    _isDone = _tick_mark;
    _answer = "<b>: " + userData.email + "</b>";
  }  
  rules = rules + "\n<pre>5." + _isDone + " Enter your E-mail address" + _answer + ".</pre>";

  _isDone = "";
  _answer = "";
  if(prefill && userData && userData.eth_wallet) {
    _isDone = _tick_mark;
    _answer = "<b>: " + userData.eth_wallet + "</b>";
  }  
  rules = rules + "\n<pre>6." + _isDone + " ETH address (No exchange wallet!)" + _answer + ".</pre>";
    

  //Rule 7
  rules = rules + "\n<pre>7. Join our " + settings.telegramGroupName + " Telegram group </pre>\n"
  rules = rules + settings.telegramGroupURL + "\n";

    

  var initial_message = welcomeText + rules;

  bot.sendMessage(msg.chat.id, initial_message, _opt);

  var _allfilled = getUnfilledField(tg_user_id, true); 
  
  //Send all filled message if already filled
  if(_allfilled == -1) {
    allFilled(msg);
  }
  else {
    questionRepeater(msg, true); 
  }

  //Ask first question after rules 
  if(_allfilled && _allfilled !== -1) {
    
  }
}

//@todo recheck all
function allFilled(msg) {
  
  var user = loadUser(msg.from.id);

  //Perform invitation count 
  var _invite_counts = getInvitesCounts(msg.from.id);
  var invite_counts = 0;
  if(_invite_counts && _invite_counts.cnt) {
    invite_counts = _invite_counts.cnt;
  }




  //clearDB(msg.from.id);
  var _output = 'You already filled out the details! Thank you for being part of ' + settings.telegramGroupName + '. Your details given below.\n\n';
  _output = _output + "<b>Name :</b> " + user.tg_username;
  _output = _output + "\n<b>Email :</b> " + user.email;
  _output = _output + "\n<b>Twitter ID :</b> " + user.twitter;
  _output = _output + "\n<b>Discord Username :</b> " + user.discord;
  _output = _output + "\n<b>Eth wallet :</b> " + user.eth_wallet;
  _output = _output + "\n\n<b>Total invites :</b> " + invite_counts; 
  //_output = _output + "\n<b>Total Earnings :</b> ";
  _output = _output + "\n<b>Your Invite Link :</b> " + getReferralLink(msg.from.id);
  //_output = _output + "\nInvite rank : 10 HNI"; //@todo invite rank after certain users joined 
  bot.sendMessage(msg.chat.id, _output, _opt); 
}

function questionRepeater(msg, commends_ok = false) {



  //@todo
  var msg_is_command = false;
  if(isCommand(msg)) {
    if(commends_ok) {

    }
    else {
      return false; // Current one is command
    }
  }

  var _cur_question = getUnfilledField(msg.from.id);
  var _load_user = loadUser(msg.from.id);
  console.log("_cur_question", _cur_question, msg.from.id, _load_user);
  if(!_cur_question) {
    allFilled(msg); //Tell everything filled
    return false;
  }
  getInput(_cur_question, msg).then((what) => {

  
    var _input = settings.inputFields[_cur_question];
    var answer = msg.text.toLowerCase();
  
    if(answer && _input.regex.test(answer)) { //check the answer is valid 

      //Check for the content to be unique
      var _is_not_unique = checkUniqueField(msg.from.id, _cur_question, answer);


      //Save the field 
      if(_is_not_unique) {
        var _errorText = '<code><b>Error! ' + _input.name + ' "' + answer + '" is already exist in our system. Please enter unique ID. </b></code>';
        bot.sendMessage(msg.chat.id, _errorText, _opt).then(() => {
          //var question = '<pre>' + _input.title + '</pre>';
          //bot.sendMessage(msg.chat.id, question, _opt);
        });;      
      }
      else {
        if(settings.inputFields[_cur_question].type === 'input') {
          updateUserField(msg.from.id, _cur_question, answer);  
        }
      }

      //Get next question
      var _next_question = getUnfilledField(msg.from.id);
      if(!_next_question) {
        allFilled(msg);
        return false;
      }    
      //Ask the next question
      //@todo put the recressive stuff here 
      //getInput(_next_question ,msg) 
    }
    else {
      var _errorText = '<code>' + _input.errorMsg + '</code>';
      bot.sendMessage(msg.chat.id, _errorText, _opt).then(() => {
        var question = '<pre>' + _input.title + '</pre>';
        bot.sendMessage(msg.chat.id, question, _opt);
      });;
    }
  });
}

function getInput(field, msg){
  console.log("current input", field, settings.inputFields[field].type)
  switch(settings.inputFields[field].type) {
    case 'input':
      return askQuestion(field, msg);
    break;
    case 'button':
      return showOptions(field, msg);
    break;
  }
}

function askQuestion(field, msg) {
  console.log("askQuestion", field, msg);
  var question = '<pre>' + settings.inputFields[field].title + '</pre>';
  return bot.sendMessage(msg.chat.id, question, _opt);
}

function showOptions(field, msg) {
  var question = '<pre>' + settings.inputFields[field].title + '</pre>';
  var __options = _opt;
  __options.reply_markup = settings.inputFields[field].botOption.reply_markup;
  return bot.sendMessage(msg.chat.id, question, __options);
}

function getUnfilledField(tg_user_id, allfield_return_minus_1 = false) {
  var user = loadUser(tg_user_id);
  if(!user) {
    return false;
  }
  var fields = ['sts_twitter_follow', 'twitter', 'discord' , 'email', 'eth_wallet'];//@todo Automate this later 
  for(let field in fields) {
    if(!user[fields[field]]) {
      return fields[field];
    }
  }
  if(allfield_return_minus_1) {
    return -1;
  }
  return false;
}

//this function gets the record of current user
//return false if new user
//return user obj if user exists
function loadUser(tg_user_id) {
  if(!parseInt(tg_user_id)) {
    return false;
  }
  sqlite.connect(config.db); 
  var sql = "SELECT * FROM telegrambot WHERE tg_user_id = " + tg_user_id + ";";
  var result = sqlite.run(sql);
  sqlite.close();
  if(_.size(result)) {
    return result[0];
  }
  return false;
}

//Update an user by User ID
function updateUser(tg_user_id, tg_username, tg_display_name, email = null, twitter = null, eth_wallet = null, discord = null, referred_by = 0) {
  if(!parseInt(tg_user_id)) {
    return false;
  }
  sqlite.connect(config.db); 
  var row = {};
  if(tg_username) { row.tg_username = tg_username;}
  if(tg_display_name) { row.tg_display_name = tg_display_name;}
  if(email) { row.email = email.toLowerCase();}
  if(twitter) { row.twitter = twitter.toLowerCase();}
  if(eth_wallet) { row.eth_wallet = eth_wallet.toLowerCase();}
  if(discord) { row.discord = discord.toLowerCase();}
  if(referred_by) { row.referred_by = referred_by;}

  var count = sqlite.update("telegrambot", row, {tg_user_id: tg_user_id});
  sqlite.close();

  return count;
}

function upsertUser(tg_user_id, tg_username, tg_display_name, email = null, twitter = null, eth_wallet = null, discord = null, referred_by = 0) {
  if(!parseInt(tg_user_id)) {
    return false;
  }   
  var user = loadUser(tg_user_id);
  //console.log("loaded user", tg_user_id, tg_username,tg_display_name, user);
  if(user) {
    return updateUser(tg_user_id, tg_username, tg_display_name, email, twitter, eth_wallet, discord, referred_by);
  }
  else {    
    return createUser(tg_user_id, tg_username, tg_display_name, email, twitter, eth_wallet, discord, referred_by);
  }
}

//Create user in table
function createUser(tg_user_id, tg_username, tg_display_name, email = null, twitter = null, eth_wallet = null, discord = null, referred_by = 0) {
  if(!parseInt(tg_user_id)) {
    return false;
  }  

  sqlite.connect(config.db); 
  var row = {};
  row.created = Math.floor(Date.now() / 1000);
  if(tg_username) { row.tg_username = tg_username;}
  if(tg_display_name) { row.tg_display_name = tg_display_name;}
  if(email) { row.email = email.toLowerCase();}
  if(twitter) { row.twitter = twitter.toLowerCase();}
  if(eth_wallet) { row.eth_wallet = eth_wallet.toLowerCase();}
  if(discord) { row.discord = discord.toLowerCase();}
  if(referred_by) { row.referred_by = referred_by;}
  if(tg_user_id) { row.tg_user_id = tg_user_id;}  

  sqlite.insert("telegrambot",row, function(res){
    if(res.error)
      throw res.error;
  });
  sqlite.close();
}

function updateUserField(tg_user_id, field, data) {
  sqlite.connect(config.db); 
  var row = {};
  row[field] = data;
  var condition = {
    tg_user_id: tg_user_id,
  };
  var count = sqlite.update("telegrambot", row, condition);
  //sqlite.close();
  console.log("updateUserField", row, count); 
  
  return count;
}

function updatedbcb(){
  console.log("updatedbcb", loadUser(439884226));
}


//Get the number of invites by given user @todo
function getInvitesCounts(tg_user_id) {
  if(!parseInt(tg_user_id)) {
    return false;
  }
  sqlite.connect(config.db); 
  var sql = "SELECT count(*) as cnt FROM telegrambot WHERE referred_by = " + tg_user_id + ";";
  var result = sqlite.run(sql);
  sqlite.close();
  if(_.size(result)) {
    return result[0];
  }
  return false;  
}

function clearDB(tg_user_id) {
  sqlite.connect(config.db); 
 // sqlite.delete('telegrambot', {tg_user_id:tg_user_id} );
  sqlite.close();

}

function setup() {
  sqlite.connect(config.db); 
  var sql = "CREATE TABLE IF NOT EXISTS telegrambot (\
    `tg_user_id` INTEGER PRIMARY KEY,\
    `tg_username` TEXT,\
    `tg_display_name` TEXT,\
    `email` TEXT NULL,\
    `twitter` TEXT NULL,\
    `eth_wallet` TEXT NULL,\
    `discord` TEXT NULL,\
    `referred_by` INTEGER DEFAULT 0,\
    `created` INTEGER,\
    `sts_tg_group` INTEGER DEFAULT 0,\
    `sts_discord_join` INTEGER DEFAULT 0,\
    `sts_twitter_follow` INTEGER DEFAULT 0\
  );";
  sqlite.run(sql,function(res){
    if(res.error)
      throw res.error; 
    console.log(res);
  });
  sqlite.close();
}

//Compose the referal link
function getReferralLink(tg_user_id) {
  if(!tg_user_id) {
    tg_user_id = settings.defaultReferralCode;
  }
  return settings.thisTelegramBotURL + "?start=" + tg_user_id;
}

function commandParser(msg, match) {

    var name = msg.chat.first_name + " (@" + msg.chat.username + ")";
    var username = msg.chat.username;

    //console.log("in start", match, msg);
    var referral_code = '';
    
    //Get the start referral code 
    if(match) {
      if(match.input !== undefined && match.input) {
        referral_code = getCommandArgumets(match.input);
      }
    }
    if(!referral_code && msg && msg.text) {
      referral_code = getCommandArgumets(msg.text);
    }
    if(!referral_code){
      referral_code = settings.defaultReferralCode;
    }

    var next_question = getUnfilledField(msg.from.id);
   
    if(!next_question) {
      //Send the rules
      //console.log("inside the command parser");
      //sendRules(msg);
    }

    
      
    //Converstion 
    if(!isCommand(msg)) {
      questionRepeater(msg);  
    }
    else {
      sendRules(msg, true);
    }
    
}


function checkUniqueField(tg_user_id, field_name, field_value) {
    
  if(!parseInt(tg_user_id)) {
    return false;
  }
  if(field_value) {
    field_value = field_value.toLowerCase();
  }
  sqlite.connect(config.db); 
  var sql = "select count(*) as cnt from telegrambot where tg_user_id != " + tg_user_id + " AND " + field_name + " == '" + field_value + "';" ;
  var result = sqlite.run(sql);
  console.log("duplicate", arguments, result);
  var result_counts = 0;
  if(_.size(result) && result[0] && parseInt(result[0].cnt)) {
    result_counts = parseInt(result[0].cnt);
    sqlite.close();
    return result_counts;
  }
  sqlite.close();
  return false;  
}


function isCommand(msg, find = '/start'){
  if(msg && msg.text && msg.text.startsWith(find)) {
    return true;
  }
  return false;
}


function tgDebug(){
  console.log(arguments);
}

function getCommandArgumets(str, command = '/start ') {
  var items = str.split(command);
  if(items && items[1]) {
    return items[1];
  }
  return '';
}
