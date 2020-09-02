const TelegramBot = require('node-telegram-bot-api');
const _ = require('underscore');
const config = require('./config')
const settings = require('./settings').settings
var sqlite = require('sqlite-sync'); //requiring


var token = config.token;


// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const img_url = 'https://starkware.co/wp-content/uploads/2019/03/logotype.svg'



//Setup the database
setup();
//Settings 
var _opt = {
  parse_mode: 'HTML',
  disable_web_page_preview: true
}



bot.on("polling_error", (err) => console.log(err));


//var regex = /\/start (\w+)/
//var regex2 = /\/start (.+)|\/start/i/
// /^\/[a-z0-9]+$/i
bot.onText(/\/start(.+)/, (msg, match) => { // (.+)
  commandParser(msg, match);

})

bot.on('message', (msg) => {
  
  upsertUser(msg.from.id, msg.from.username, msg.from.first_name)
  questionRepeater(msg);
})

bot.onText(/\/start/, (msg, match) => { // (.+)
  commandParser(msg, match);
})


//Send rules when /start typed
//@todo prefill options
function sendRules(name, msg, data = {}, prefill = false) {
  var welcomeText = "Hello " + name + "\n\nWelcome to " + settings.telegramGroupName + "!\
  Join our community and refer to get upto $1000 worth of HNI tokens.\n\n";

  var _data = {
    email: '',
    twitter: '',
    eth_wallet: '',
  };



  var rules = "<b>Airdrop Rules</b>:\n\
    \n<pre>1. Enter your Twitter</pre> \
    \n<pre>2. Enter your E-mail address</pre> \
    \n<pre>3. ETH address (No exchange wallet!)</pre>\
    \n<pre>4. Follow our Twitter</pre> \n" + settings.twitterURL + " \n\
    \n<pre>5. Join the " + settings.telegramGroupName + " Telegram group </pre>\n" + settings.telegramGroupURL + '\n'  ;

  var initial_message = welcomeText + rules;

  bot.sendMessage(msg.chat.id, initial_message, _opt);
}

function allFilled(msg) {
  
  var user = loadUser(msg.from.id);
  //clearDB(msg.from.id);
  var _output = 'Thank you for being part of HNI Network community! \n\n';
  _output = _output + "<b>Name :</b> " + user.tg_username;
  _output = _output + "\n<b>Email :</b> " + user.email;
  _output = _output + "\n<b>Twitter ID :</b> " + user.twitter;
  _output = _output + "\n<b>Eth wallet :</b> " + user.eth_wallet;
  _output = _output + "\n\n<b>Total invites :</b> 0";
  _output = _output + "\n<b>Total Earnings :</b> 10 HNI";
  _output = _output + "\n<b>Your Invite Link :</b> " + getReferralLink(msg.from.id);
  //_output = _output + "\nInvite rank : 10 HNI"; //@todo invite rank after certain users joined 
  bot.sendMessage(msg.chat.id, _output, _opt);
}

function questionRepeater(msg) {
  var _cur_question = getUnfilledField(msg.from.id);
  if(!_cur_question) {
    allFilled(msg);
    return false;
  }
  //askQuestion(_cur_question, msg);
  var _input = settings.inputFields[_cur_question];
  var answer = msg.text;
  
  if(answer && _input.regex.test(answer)) {
    //Save the field 
    updateUserField(msg.from.id, _cur_question, answer);
    //Get next question
    var _next_question = getUnfilledField(msg.from.id);
    if(!_next_question) {
      allFilled(msg);
      return false;
    }    
    //Ask the next question
    askQuestion(_next_question ,msg)
  }
  else {
    var _errorText = '<code>' + _input.errorMsg + '</code>';
    bot.sendMessage(msg.chat.id, _errorText, _opt).then(() => {
      var question = '<pre>' + _input.title + '</pre>';
      bot.sendMessage(msg.chat.id, question, _opt);
    });;
  }
}

function askQuestion(field, msg) {
  var question = '<pre>' + settings.inputFields[field].title + '</pre>';
  bot.sendMessage(msg.chat.id, question, _opt);
}

function getUnfilledField(tg_user_id) {
  var user = loadUser(tg_user_id);
  if(!user) {
    return false;
  }
  var fields = ['email', 'twitter', 'eth_wallet'];//@todo Automate this later 
  for(let field in fields) {
    if(!user[fields[field]]) {
      return fields[field];
    }
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
function updateUser(tg_user_id, tg_username, tg_display_name, email = '', twitter = '', eth_wallet = '', referred_by = '') {
  if(!parseInt(tg_user_id)) {
    return false;
  }
  sqlite.connect(config.db); 
  var row = {};
  if(tg_username) { row.tg_username = tg_username;}
  if(tg_display_name) { row.tg_display_name = tg_display_name;}
  if(email) { row.email = email;}
  if(twitter) { row.twitter = twitter;}
  if(eth_wallet) { row.eth_wallet = eth_wallet;}
  if(referred_by) { row.referred_by = referred_by;}

  var count = sqlite.update("telegrambot", row, {tg_user_id: tg_user_id});
  sqlite.close();

  return count;
}

function upsertUser(tg_user_id, tg_username, tg_display_name, email = '', twitter = '', eth_wallet = '', referred_by = '') {
  if(!parseInt(tg_user_id)) {
    return false;
  }   
  var user = loadUser(tg_user_id);
  console.log("loaded user", tg_user_id, tg_username,tg_display_name, user);
  if(user) {
    return updateUser(tg_user_id, tg_username, tg_display_name, email, twitter, eth_wallet, referred_by);
  }
  else {    
    return createUser(tg_user_id, tg_username, tg_display_name, email, twitter, eth_wallet, referred_by);
  }
}

//Create user in table
function createUser(tg_user_id, tg_username, tg_display_name, email = '', twitter = '', eth_wallet = '', referred_by = '') {
  if(!parseInt(tg_user_id)) {
    return false;
  }  

  sqlite.connect(config.db); 
  var row  = {
    tg_user_id: tg_user_id,
    tg_username: tg_username,
    tg_display_name: tg_display_name,
    email: email,
    twitter: twitter,
    eth_wallet: eth_wallet,
    referred_by: referred_by,
    created: Math.floor(Date.now() / 1000),
  };
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
  var count = sqlite.update("telegrambot", row, {tg_user_id: tg_user_id});
  sqlite.close();
  return count;
}


//Get the number of invites by given user
function getInvitesCounts(tg_user_id) {

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
    `email` TEXT NOT NULL UNIQUE,\
    `twitter` TEXT NOT NULL,\
    `eth_wallet` TEXT NOT NULL UNIQUE,\
    `referred_by` INTEGER DEFAULT 0,\
    `created` INTEGER\
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
  return "http://t.me/JoinHNINetworkBot?start=" + tg_user_id;
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
   
    //Send the rules
    sendRules(name, msg);
      
    //Converstion 
    questionRepeater(msg);
}


function getCommandArgumets(str, command = '/start ') {
  var items = str.split(command);
  if(items && items[1]) {
    return items[1];
  }
  return '';
}
