const TelegramBot = require('node-telegram-bot-api');
const _ = require('underscore');
const config = require('./config')
const settings = require('./settings').settings
var sqlite = require('sqlite-sync'); //requiring


var token = config.token;

const TG = require('telegram-bot-api')

const api = new TG({token: token});

//api.getMe().then((asd)=>{console.log("asd", asd)}).catch(console.err);

//"@JoinHNINetworkBot"
// 1372379913
// 439884226
try {
  //api.getChat("@JoinHNINetwork");
  api.getChatMembersCount("@JoinHNINetwork").then((asd)=>{console.log("asd 2", asd)}).catch(console.err);;//.then(console.log).catch(console.err);;
}
catch(e) {
  console.log("in try catch", e);
}