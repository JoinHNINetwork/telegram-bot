const TelegramBot = require('node-telegram-bot-api');
const _ = require('underscore');
const config = require('./config')
const settings = require('./settings').settings
var sqlite = require('sqlite-sync'); //requiring
//var tgBot = require('./tgBotLib'); //requiring

var token = config.token;

//const TG = require('telegram-bot-api')
testdiscord();

function testdiscord() {
  var strs = [
    'adal@234',
    '234@234',
    'adal#2344',
    '234#2344',
    'adal#244',
    '234#244',    
    'adalar',
    '234',        
  ];
for(var _index in strs) {
  var str = strs[_index];
  var yes = validateDiscord(str) ? 'yes' : 'no';
  console.log(str, yes);
}  
}

function testtwitter() {
var strs = [
  'https://twitter.com',
  'http://twitter.com',
  'http://www.twitter.com',
  'https://www.twitter.com',
  'https://twitter.com/#$adalq',
  'http://twitter.com/444adalf',
  'http://www.twitter.com/adal234',
  'https://www.twitter.com/234adal', 
  'http://www.twitter.com/adal arasu',
  'https://www.twitter.com/adal arasu',    
  'adasdasd',
  '@asdasd',
];
for(var _index in strs) {
  var str = strs[_index];
  var yes = isTwitterHandle(str) ? 'yes' : 'no';
  console.log(str, yes);
}
}

function validateDiscord(username) {
  const re = /^[^#]{2,32}#\d{4}$/;

  //username = String(username).toLowerCase();
  if(username && re.test(username)) {
    return username;
  }
  return false;
}

function isTwitterHandle(handle) { 
  if (handle.match(/^((?:http:\/\/)?|(?:https:\/\/)?)?(?:www\.)?twitter\.com\/(\w+)$/i)){
    handle = handle.split(".com/").pop();
  }
  if(handle.indexOf('@') > -1) {
    handle = handle.split("@").pop();
  }  
  if(handle.match(/^@?(\w+)$/)) {
    return handle;
  }
  return false;  
}
