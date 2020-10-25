var settings = {
  telegramGroupURL: 'http://t.me/FontCommunityGroup',
  telegramGroupName: 'Font Community',
  thisTelegramBotURL: 'http://t.me/FontCommunityBot',
  tokenSymbol: '$FONT',

  //Discord stuffs
  discordLink: "https://discord.gg/HW82aHx",

  twitterURL: 'https://twitter.com/FontCommunity',

  logo: 'https://font.community/wp-content/uploads/2020/10/logo-blue.png',

  defaultReferralCode: '439884226',
  inputFields: {
    twitter: {
      title: 'Enter your Twitter Account (Ex: yourtwittername)',
      description: 'Email Address is mandatory',
      machine_name: 'twitter',
      required: true,
      regex: /^[a-zA-Z0-9_]{1,15}$/,
      checkDuplicate: true,
      errorMsg: 'Invalid twitter format, enter again.'
    },
    discord: {
      title: 'Discord User name',
      description: 'Discord User name',
      machine_name: 'eth_wallet',
      required: true,
      regex: /.+/s,
      checkDuplicate: false,
      errorMsg: ''
    },    
    email: {
      title: 'Enter your Email Address',
      description: 'Email Address is mandatory',
      machine_name: 'email',
      required: true,
      regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm,
      checkDuplicate: true,
      errorMsg: 'Invalid Email address, enter again.'
    },

    eth_wallet: {
      title: 'ETH address (No exchange wallet!)',
      description: 'ETH Address is mandatory',
      machine_name: 'eth_wallet',
      required: true,
      regex: /^0x[a-fA-F0-9]{40}$/g,
      checkDuplicate: true,
      errorMsg: 'Invalid Ethereum Address, enter again.' 
    },

  },

};



exports.settings = settings;