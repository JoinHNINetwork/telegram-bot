var sqlite = require('sqlite-sync'); //requiring
const config = require('./config')

sqlite.connect(config.db); 
var sql = "SELECT * FROM telegrambot;";
var result = sqlite.run(sql);
sqlite.close();

console.log(result);