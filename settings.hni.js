var settings = {
  telegramGroupURL: 'https://t.me/JoinHNINetwork',
  telegramGroupName: 'HNI Network',
  thisTelegramBotURL: 'http://t.me/JoinHNINetworkBot',
  tokenSymbol: 'HNI',

  //Discord stuffs
  discordLink: "https://discord.com/join/@todo",

  twitterURL: 'https://twitter.com/JoinHNINetwork',

  logo: 'https://starkware.co/wp-content/uploads/2019/03/logotype.svg',

  defaultReferralCode: '439884226',
  inputFields: {
    email: {
      title: 'Enter your Email Address',
      description: 'Email Address is mandatory',
      machine_name: 'email',
      required: true,
      regex: /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm,
      checkDuplicate: true,
      errorMsg: 'Invalid Email address, enter again.'
    },
    twitter: {
      title: 'Enter your Twitter Account (Ex: yourtwittername)',
      description: 'Email Address is mandatory',
      machine_name: 'twitter',
      required: true,
      regex: /^[a-zA-Z0-9_]{1,15}$/,
      checkDuplicate: true,
      errorMsg: 'Invalid twitter format, enter again.'
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
    discord: {
      title: 'Discord User name',
      description: 'Discord User name',
      machine_name: 'eth_wallet',
      required: true,
      regex: /.+/s,
      checkDuplicate: false,
      errorMsg: ''
    },
  },

};



exports.settings = settings;