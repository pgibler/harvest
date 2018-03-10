const axios = require('axios')

module.exports = class BittrexFarmer {
  static id() { return "bittrex"; }

  constructor(data) {
    this.key = data.key;
    this.secret = data.secret;
  }

  harvest() {
    return new Promise((resolve, reject) => {
      axios.get('https://api.hitbtc.com/api/2/history/trades', {
        auth: {
          username: this.key,
          password: this.secret
        }
      })
      .then(response => resolve(response
        .data
        .map(trade => { 
          return new crops.Trade(new Date(trade.timestamp), trade.price, trade.quantity, trade.fee, 'HitBTC')
        })));
    })
  }
}