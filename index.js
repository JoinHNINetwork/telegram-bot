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
  upsertUser(msg.from.id, msg.from.username, msg.from.first_name);
  questionRepeater(msg);
})

//When Error
bot.on("polling_error", (err) => console.log(err));


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
  
  //Rule 1
  rules = rules + "\n<pre>1. Join our " + settings.telegramGroupName + " Telegram group </pre>\n"
  rules = rules + settings.telegramGroupURL + "\n";

  //Rule 2
  rules = rules + "\n<pre>2. Follow our Twitter</pre> \n" + settings.twitterURL + " \n";
  
  //Rule 3 get twitter ID
  var _isDone = "";
  var _answer = "";
  if(prefill && userData && userData.twitter) {
    _isDone = _tick_mark;
    _answer = "<b>: " + userData.twitter + "</b>";
  }
  rules = rules + "\n<pre>3." + _isDone + " Enter your Twitter ID " + _answer + ".</pre>";

  //Rule 4 Join the Discord Server
  rules = rules + "\n<pre>4. Join our Discord</pre> \n" + settings.discordLink + " \n";

  //Rule 5 get discord ID
  var _isDone = "";
  var _answer = "";
  if(prefill && userData && userData.discord) {
    _isDone = _tick_mark;
    _answer = "<b>: " + userData.discord + "</b>";
  }
  rules = rules + "\n<pre>5." + _isDone + " Enter your Discord Username" + _answer + ".</pre>";  

  // Rule 4 get the email id
  _isDone = "";
  _answer = "";
  if(prefill && userData && userData.email) {
    _isDone = _tick_mark;
    _answer = "<b>: " + userData.email + "</b>";
  }  
  rules = rules + "\n<pre>6." + _isDone + " Enter your E-mail address" + _answer + ".</pre>";

  _isDone = "";
  _answer = "";
  if(prefill && userData && userData.eth_wallet) {
    _isDone = _tick_mark;
    _answer = "<b>: " + userData.eth_wallet + "</b>";
  }  
  rules = rules + "\n<pre>7." + _isDone + " ETH address (No exchange wallet!)" + _answer + ".</pre>";
    
    

  var initial_message = welcomeText + rules;

  bot.sendMessage(msg.chat.id, initial_message, _opt);

  var _allfilled = getUnfilledField(tg_user_id, true);
  if(_allfilled == -1) {
    allFilled(msg);
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

function questionRepeater(msg) {

  if(isCommand(msg)) {
    return true;
  }

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

function getUnfilledField(tg_user_id, allfield_return_minus_1 = false) {
  var user = loadUser(tg_user_id);
  if(!user) {
    return false;
  }
  var fields = [ 'twitter', 'discord' , 'email', 'eth_wallet'];//@todo Automate this later 
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
function updateUser(tg_user_id, tg_username, tg_display_name, email = '', twitter = '', eth_wallet = '', discord = '', referred_by = '') {
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
  if(discord) { row.discord = discord;}
  if(referred_by) { row.referred_by = referred_by;}

  var count = sqlite.update("telegrambot", row, {tg_user_id: tg_user_id});
  sqlite.close();

  return count;
}

function upsertUser(tg_user_id, tg_username, tg_display_name, email = '', twitter = '', eth_wallet = '', discord = '', referred_by = '') {
  if(!parseInt(tg_user_id)) {
    return false;
  }   
  var user = loadUser(tg_user_id);
  console.log("loaded user", tg_user_id, tg_username,tg_display_name, user);
  if(user) {
    return updateUser(tg_user_id, tg_username, tg_display_name, email, twitter, eth_wallet, discord, referred_by);
  }
  else {    
    return createUser(tg_user_id, tg_username, tg_display_name, email, twitter, eth_wallet, discord, referred_by);
  }
}

//Create user in table
function createUser(tg_user_id, tg_username, tg_display_name, email = '', twitter = '', eth_wallet = '', discord = '', referred_by = '') {
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
    discord: discord,
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
    `email` TEXT NOT NULL UNIQUE,\
    `twitter` TEXT NOT NULL,\
    `eth_wallet` TEXT NOT NULL UNIQUE,\
    `discord` TEXT NOT NULL,\
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
      console.log("inside the command parser");
      //sendRules(msg);
    }

    console.log("comnnads", msg, match);
      
    //Converstion 
    if(!isCommand(msg)) {
      questionRepeater(msg);  
    }
    else {
      sendRules(msg, true);
    }
    
}


function checkUniqueField(tg_user_id, field_name, field_value) {
  var _sql = "select count(*) as cnt from telegrambot where tg_user_id != " + tg_user_id + " AND " + field_name + " == '" + field_value + "';" ;
  console.log(_sql);  
}


function isCommand(msg, find = '/start'){
  if(msg && msg.text && msg.text.startsWith(find)) {
    return true;
  }
  return false;
}

function getCommandArgumets(str, command = '/start ') {
  var items = str.split(command);
  if(items && items[1]) {
    return items[1];
  }
  return '';
}
