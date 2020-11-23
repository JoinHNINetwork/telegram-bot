const TelegramBot = require('node-telegram-bot-api');
const _ = require('underscore');
const config = require('./config')
const settings = require('./settings').settings
var sqlite = require('sqlite-sync'); //requiring


var token = config.token;



// Create a bot that uses 'polling' to fetch new updates
//const bot = new TelegramBot(token, {polling: true});
const img_url = settings.logo;

//Settings 
//Todo move to 
var _opt = {
  parse_mode: 'HTML',
  disable_web_page_preview: true
}



// get input from user and dispatch based on input type
function getInput(field, msg, bot){
  console.log("current input", field, settings.inputFields[field].type)
  switch(settings.inputFields[field].type) {
    case 'input':
      return askQuestion(field, msg, bot);
    break;
    case 'button':
      return showOptions(field, msg, bot);
    break;
  }
}
exports.getInput = getInput;


//Send rules when /start typed
//@todo prefill options
function sendRules(msg, bot, prefill = false) {

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
    allFilled(msg, bot);
  }
  else {
    questionRepeater(msg, bot, true); 
  }

  //Ask first question after rules 
  if(_allfilled && _allfilled !== -1) {
    
  }
}
exports.sendRules = sendRules;



//@todo recheck all
function allFilled(msg, bot) {
  
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
exports.allFilled = allFilled;


//Repeats the unfinished question again and again
function questionRepeater(msg, bot, commends_ok = false) {
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
    allFilled(msg, bot); //Tell everything filled
    return false;
  }
  getInput(_cur_question, msg, bot).then((what) => {

  
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
        allFilled(msg, bot);
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
exports.questionRepeater = questionRepeater;



function askQuestion(field, msg, bot) {
  console.log("askQuestion", field, msg);
  var question = '<pre>' + settings.inputFields[field].title + '</pre>';
  return bot.sendMessage(msg.chat.id, question, _opt);
}
exports.askQuestion = askQuestion;



function showOptions(field, msg, bot) {
  var question = '<pre>' + settings.inputFields[field].title + '</pre>';
  var __options = _opt;
  __options.reply_markup = settings.inputFields[field].botOption.reply_markup;
  return bot.sendMessage(msg.chat.id, question, __options);
}
exports.showOptions = showOptions;



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
exports.loadUser = loadUser;


//Check if field value is unique for given user
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
exports.checkUniqueField = checkUniqueField;


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
exports.getInvitesCounts = getInvitesCounts;




//Get unfilled field for given user
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
exports.getUnfilledField = getUnfilledField;



//Clear DB of specific user
//@todo
function clearDB(tg_user_id) {
  sqlite.connect(config.db); 
 // sqlite.delete('telegrambot', {tg_user_id:tg_user_id} );
  sqlite.close();
}
exports.clearDB = clearDB;



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
exports.createUser = createUser;


//Get unfilled field of an user
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
exports.getUnfilledField = getUnfilledField;



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
exports.updateUser = updateUser;


//insert or update a user
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
exports.upsertUser = upsertUser;




//Update a single user field data
function updateUserField(tg_user_id, field, data) {
  sqlite.connect(config.db); 
  var row = {};
  row[field] = data;
  var condition = {
    tg_user_id: tg_user_id,
  };
  var count = sqlite.update("telegrambot", row, condition);
  sqlite.close();
  console.log("updateUserField", row, count); 
  
  return count;
}
exports.updateUserField = updateUserField;


//Setup the database table
function setupTable(tablename) {
  if(!tablename) {
    tablename = 'telegrambot';
  }

  sqlite.connect(config.db); 
  var sql = "CREATE TABLE IF NOT EXISTS " + tablename + " (\
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
exports.setupTable = setupTable;



//Function that prints console log
function tgDebug(){
  console.log(arguments);
}
exports.tgDebug = tgDebug;


//Check if this function is a command
function isCommand(msg, find = '/start'){
  if(msg && msg.text && msg.text.startsWith(find)) {
    return true;
  }
  return false;
}
exports.isCommand = isCommand;

//Parse the command/input and dispatch the actions
function commandParser(msg, match, bot) {

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
      questionRepeater(msg, bot);  
    }
    else {
      sendRules(msg, bot, true);
    }
    
}
exports.commandParser = commandParser;


//Get the command arguments
function getCommandArgumets(str, command = '/start ') {
  var items = str.split(command);
  if(items && items[1]) {
    return items[1];
  }
  return '';
}
exports.getCommandArgumets = getCommandArgumets;


//Compose the referal link from TG user id
function getReferralLink(tg_user_id) {
  if(!tg_user_id) {
    tg_user_id = settings.defaultReferralCode;
  }
  return settings.thisTelegramBotURL + "?start=" + tg_user_id;
}
exports.getReferralLink = getReferralLink;
