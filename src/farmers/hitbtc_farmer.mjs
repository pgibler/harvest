const { Trade } = require('../crop.mjs')
const tool = require('../tool.mjs')

module.exports = class HitBTCFarmer {
  static id() { return "hitbtc"; }

  constructor(data) {
    this.key = data.key;
    this.secret = data.secret;
  }

  harvest() {
    return new Promise((resolve, reject) => {
      const tradesPromise = tool.harvestPassworded('https://api.hitbtc.com/api/2/history/trades', this.key, this.secret)
        .then(data => data.map(trade => new Trade(trade.id, trade.symbol, trade.timestamp, trade.price, trade.quantity, trade.fee, 'HitBTC')));
      const transactionsPromise = tool.harvestPassworded('https://api.hitbtc.com/api/2/account/transactions', this.key, this.secret)
        .then(data => data);
      
      Promise.all([tradesPromise, transactionsPromise]).then(values => {
        const trades = values[0];
        const transactions = values[1].filter(txn => txn.status == 'success');
        const deposit = transactions.filter(txn => txn.type == 'payin');
        const withdrawals = transactions.filter(txn => txn.type == 'payout');

        return {
          trades: values[0],
          deposits: deposits,
          withdrawals: withdrawals
        }
      });
    });
  }
}
