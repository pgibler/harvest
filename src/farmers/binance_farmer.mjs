
const crops = require('../crops.mjs')

module.exports = class BinanceFarmer {
  static id() { return "binance"; }

  constructor(data) {
    this.key = data.key;
    this.secret = data.secret;
  }

  harvest() {
    return new Promise((resolve, reject) => {
      const client = new coinbase.Client({'apiKey': this.key, 'apiSecret': this.secret});

      client.getTransactions(null, (err, txns) => {
        txns.forEach(txn => {
          console.log(`id: ${txn.id}`);
        })

        resolve(txns)
      });
    })
  }
}