var settings = {
  telegramGroupURL: 'https://t.me/JoinHNINetwork',
  telegramGroupName: 'HNI Network',

  twitterURL: 'https://twitter.com/JoinHNINetwork',

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
      title: 'Enter your Twitter Account (without "@" Ex: yourtwittername)',
      description: 'Email Address is mandatory',
      machine_name: 'twitter',
      required: true,
      regex: /^[a-zA-Z0-9_]{1,15}$/,
      checkDuplicate: true,
      errorMsg: 'Invalid twitter format, enter again.'
    },
    eth_wallet:{
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