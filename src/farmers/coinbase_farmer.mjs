const coinbase = require('coinbase')
const crop = require('../crop.mjs')

// Requires the following permissions on coinbase API:
// wallet:addresses:read
// wallet:transactions:read
// wallet:deposits:read
// wallet:withdrawals:read
module.exports = class CoinbaseFarmer {
  static id() { return "coinbase"; }

  constructor(data) {
    this.key = data.key;
    this.secret = data.secret;
  }

  harvest() {
    return new Promise((resolve, reject) => {
      const client = new coinbase.Client({'apiKey': this.key, 'apiSecret': this.secret});

      // Iterate cryptocurrency addresses and collect information.
      client.getAccounts({}, (err, accounts) => {
        if(err) {
          reject(err);
        } else {
          // Collect all addresses as a promise.
          const addressPromises = accounts.map(account => new Promise((success, failure) => {
            account.getAddresses(null, (err, addresses) => {
              if(err) failure(err);
              if(addresses) {
                const txnsPromise = addresses.map(address => new Promise((win, lose) => {
                  address.getTransactions(null, (err, txns) => {
                    if(err) lose(err);
                    if(txns) win({ address: address, txns: txns});
                  })
                }));
                // TODO this needs to be figured out.
                Promise.all(txnsPromise).then(values => {
                  success({
                    address: [],
                    transactions: []
                  });
                });
              };
            });
          }));

          // TODO ditto for this.
          Promise.all(addressPromises).then(values => {

          });
        }
      });
    });
  };
}
