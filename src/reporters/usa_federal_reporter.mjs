const Form8949 = require('./form8949.mjs');
const AssetRouteGraph = require('../graphs/asset_route_graph.mjs');
const path = require('path');

class USATradeHistory {
  constructor(catalog) {
    this.trades = this.calculateTrades(catalog);
  }

  calculateTrades(catalog) {
    const graph = new AssetRouteGraph(catalog);
    graph.calculateNodes();
    // Contains a hash of addresses and list of cost basis in them
    const addressBasis = {};
    return;
  }
}

module.exports = class USAFederalReporter {
  constructor(folder) {
    this.folder = folder;
  }

  generateDocuments(catalog) {
    return new Promise((resolve, reject) => {
      const tradeHistory = new USATradeHistory(catalog);
      const form = new Form8949();
      form.fullName = 'Paul Gibler';
      form.socialSecurity = '4443331';
      form.setPage1TradeType("C");
      form.setPage2TradeType("C");
      form.addPage1Trade('5 BTC for 20 ETH', '01/05/2018', '01/22/2018', '$100,000', '$50,000', '-$50,000');
      form.addPage1Trade('2 BTC for 50000 REQ', '03/10/2018', '03/15/2019', '$20,000', '$25,000', '$5,000');
      form.addPage1Trade('10 ETH for 5 BTC', '01/03/2018', '5/1/2018', '$7,000', '$80,000', '$75,000');
      form.addPage2Trade('5 BTC for 1 ETH', '01/05/2018', '01/22/2018', '$100,000', '$50,000', '-$50,000');
      form.addPage2Trade('2 BTC for 1000 LTC', '03/10/2018', '03/15/2019', '$20,000', '$25,000', '$5,000');
      form.addPage2Trade('10 ETH for 1000 BTC', '01/03/2018', '5/1/2018', '$7,000', '$80,000', '$75,000');
      form.setPage1Totals('$100,000', '$50,000', '', '$100,000');
      form.setPage2Totals("$50,000", "$100,000,000", "", "$300,000");
      form.write(path.join(this.folder, 'form8949.pdf')).then(()=> resolve(form));
    });
  }
}
