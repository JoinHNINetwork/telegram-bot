var discordLink = "https://discord.gg/HW82aHx";
var twitterURL = 'https://twitter.com/FontCommunity';
var telegramGroupURL = 'http://t.me/FontCommunityGroup';

var settings = {
  telegramGroupURL: telegramGroupURL,
  telegramGroupName: 'Font Community',
  thisTelegramBotURL: 'http://t.me/FontCommunityBot',
  tokenSymbol: '$FONT',

  //Discord stuffs
  discordLink: discordLink,
  twitterURL: twitterURL,

  logo: 'https://font.community/wp-content/uploads/2020/10/logo-blue.png',

  defaultReferralCode: '439884226',
  inputFields: {
    sts_twitter_follow: {
      //title: 'Follow our Twitter, Like and Retweet the pinned tweet',
      title: 'Follow our Twitter, Like and Retweet the pinned tweet:\nhttps://twitter.com/FontCommunity',
      machine_name: 'sts_twitter_follow',
      required: true,
      type: 'button',
      regex: /.+/s,
      validator: 'validateTrue',
      botOption: {
        'reply_markup': {
          'inline_keyboard': [[
            {
              text: 'Done Twitter Task',
              callback_data: '1'
            }
          ]],
          resize_keyboard: true,
          one_time_keyboard: true,
          force_reply: true,
        }
      },
      value: 1,
    },

    twitter: {
      title: 'Enter your Twitter Account (Ex: yourtwittername)',
      description: 'Email Address is mandatory',
      name: 'Twitter handle',
      machine_name: 'twitter',
      required: true,
      regex: /^[a-zA-Z0-9_]{1,15}$/,
      validator: 'validateTwitter',
      checkDuplicate: true,
      errorMsg: 'Invalid twitter format, enter again.',
      type: 'input',
    },
    sts_discord_join: {
      //title: 'Follow our Twitter, Like and Retweet the pinned tweet',
      title: 'Join our Discord:\n' + twitterURL,
      machine_name: 'sts_discord_join',
      required: true,
      type: 'button',
      regex: /.+/s,
      validator: 'validateTrue',
      botOption: {
        'reply_markup': {
          'inline_keyboard': [[
            {
              text: 'Joined Discord',
              callback_data: '1'
            }
          ]],
          resize_keyboard: true,
          one_time_keyboard: true,
          force_reply: true,
        }
      },
      value: 1,
    },

    discord: {
      title: 'Enter your Discord User name',
      description: 'Discord User name',
      name: 'Discord User Name',
      machine_name: 'discord',
      required: true,
      validator: 'validateDiscord',
      regex: /.+/s,
      checkDuplicate: false,
      errorMsg: 'Invalid Discord Username format, enter again.',
      type: 'input',
    },    
    email: {
      title: 'Enter your Email Address',
      description: 'Email Address is mandatory',
      name: 'Email Address',
      machine_name: 'email',
      required: true,
      validator: 'validateEmail',
      regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}/igm,
      checkDuplicate: true,
      errorMsg: 'Invalid Email address, enter again.',
      type: 'input',
    },

    eth_wallet: {
      title: 'ETH address (No exchange wallet!)',
      description: 'ETH Address is mandatory',
      name: 'Ethereum Address',
      machine_name: 'eth_wallet',
      required: true,
      validator: 'validateEthAddress',
      regex: /^0x[a-fA-F0-9]{40}$/g,
      checkDuplicate: true,
      errorMsg: 'Invalid Ethereum Address, enter again.',
      type: 'input',
    },
    sts_tg_group: {
      //title: 'Follow our Twitter, Like and Retweet the pinned tweet',
      title: 'Join our Telegram Group:\n' + telegramGroupURL,
      machine_name: 'sts_tg_group',
      required: true,
      type: 'button',
      regex: /.+/s,
      validator: 'validateTrue',
      botOption: {
        'reply_markup': {
          'inline_keyboard': [[
            {
              text: 'Joined Telegram group',
              callback_data: '1'
            }
          ]],
          resize_keyboard: true,
          one_time_keyboard: true,
          force_reply: true,
        }
      },
      value: 1,
    },

  },

};



exports.settings = settings;