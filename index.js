const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '1372379913:AAHoLXfoDxjr8Y4GJQquMcTmuhGUHfc3UhY';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const img_url = 'https://starkware.co/wp-content/uploads/2019/03/logotype.svg'
const telegramGroupURL = 'https://t.me/JoinHNINetwork';
const telegramGroupName = 'HNI Network';

//Variables 
var username = '';
var email = '';
var twitterID = '';
var eth_wallet = '';
var referredby = '';


var option = {
  "reply_markup": {
    "keyboard": [
      ["1. Join the " + telegramGroupName + " group"],   
      ["2. E-mail address"] , 
      ["3. ETH address (No exchange wallet!)"]
    ]
  }
};  

//var regex = /\/start (\w+)/
//var regex2 = /\/start (.+)|\/start/i/
bot.onText(/\/start (.+)/, (msg, match) => {



    

    var name = msg.chat.first_name + " (@" + msg.chat.username + ")";
    var username = msg.chat.username;

    //console.log("in start", match, msg);
    var referral_code = 'Adalquardz';
    
    if(match && match[1] !== undefined) {
        var referral_code = match[1];
        console.log("Referral code: " + referral_code);
    }    

    var welcomeText = "Hello " + name + "\n\nWelcome to " + telegramGroupName + "! 😍😍 \
      \n\nJoin our community and refer to get upto $1000 worth of HNI tokens.\n \n "

    var rules = "Airdrop Rules ⚔️⚔️\
      \n 1. Join the " + telegramGroupName + " Telegram group \
      \n 2. E-mail address \
      \n 3. Follow our Twitter \
      \n 4. ETH address (No exchange wallet!) \n\
      \n REF :: " + referral_code;

    bot.sendMessage(msg.chat.id, welcomeText).then(() => {

        bot.sendMessage(msg.chat.id, rules ,option);
    })
})

bot.on('message', (msg) => {
    console.log("on message", msg);
    var send_text = msg.text;
    var step1_text = '1. Join the ' + telegramGroupName + ' group'
    if (send_text.toString().indexOf(step1_text) === 0) {
        var text = telegramGroupName + ' Telegram Group';
        var keyboardStr = JSON.stringify({
            inline_keyboard: [
            [
                {text:'Join ' + telegramGroupName,url: telegramGroupURL}
            ]
            ]
        });

        var keyboard = {reply_markup: JSON.parse(keyboardStr)};
        bot.sendMessage(msg.chat.id,text,keyboard);
    }


    var step3_text = '2. E-mail address';
    if(send_text.toString().indexOf(step3_text) === 0) {
        bot.sendMessage(msg.chat.id, "Enter your email address");
    }
    
    var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
    
    if(re.test(send_text)) {
        u_email = send_text;
        bot.sendMessage(msg.chat.id, "Email address: "+send_text);
    }
    else {
      //bot.sendMessage(msg.chat.id, "Enter your email address");
    }

    var step4_text = '3. ETH address (No exchange wallet!)';
    if(send_text.toString().indexOf(step4_text) === 0) {
        bot.sendMessage(msg.chat.id, "Make sure that you have an erc20 wallet (0x) 🔑")
    }
    var re_eth = /^0x[a-fA-F0-9]{40}$/g
    if(re_eth.test(send_text)) {
        e_wallet = send_text;
        bot.sendMessage(msg.chat.id, 'Confirm❓', {
            reply_markup: {
              keyboard: [
               [{"text": "Yes ✅"}],
               [{"text": "Cancel ❌"}]
            ],
            resize_keyboard: true
            }
         })
    }
    var confirm = 'Yes ✅';
  if(send_text.toString().indexOf(confirm) === 0) {
      bot.sendMessage(msg.chat.id, "Thank'you 🙏🙏 \n"); 
      bot.sendMessage(msg.chat.id, `Telegram username: ${t_username} \n Email: ${u_email} \n Ethereum wallet: ${e_wallet} \n`).then(() => {
        //bot.sendMessage(msg.chat.id, "Check your account 👉 "+ 'https://niawjunior.github.io/telegram-bot-airdrop.io/index.html?id='+e_wallet.toLocaleLowerCase())
      })

            //var db = firebase.database().ref('Airdrop');
            //db.child(e_wallet.toLocaleLowerCase()).once('value', snap => {
                //if(!snap.exists()) {
                    /*db.child(e_wallet.toLocaleLowerCase()).update({
                        telegram_username: t_username,
                        email: u_email,
                        wallet: e_wallet.toLocaleLowerCase(),
                        status: 'pending',
                        createAt: Date.now()
                    }).then(() => {
                    */
      
      
      

                     /*   })
                    }).catch((err) => {
                        console.log(err)
                    })*/
                //} else {
                //    bot.sendMessage(msg.chat.id, "This wallet is already in use")
                //}
            //})
    }    
    var calcel = 'Cancel ❌';
    if(send_text.toString().indexOf(calcel) === 0) {
        bot.sendMessage(msg.chat.id, "Good bye ✌️✌️"); 
    }
});