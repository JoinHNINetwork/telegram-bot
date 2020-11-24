var sqlite = require('sqlite-sync'); //requiring
const config = require('./config');
var tgBot = require('./tgBotLib'); //requiring

sqlite.connect(config.db); 

//tgBot.setupTable('telegrambot');

var sql = "SELECT * FROM telegrambot;";
var result = sqlite.run(sql);
sqlite.close();

console.log(result);