const fs = require('fs')
const keys = require('./keys.mjs')
const bitcoin = require('./bitcoin.mjs')
const crop = require('./crop.mjs')
const USAFederalReporter = require('./reporters/usa_federal_reporter.mjs')

// Farmers
const HitBTCFarmer = require('./farmers/hitbtc_farmer.mjs')
const CoinbaseFarmer = require('./farmers/coinbase_farmer.mjs')

function app() {
  const reportsFolder = './reports';
  if (!fs.existsSync(reportsFolder)) {
    fs.mkdirSync(reportsFolder);
  }

  const bitcoinCoinbaseAddress = "1btc";
  const bitcoinExchangeAddress = "2btc";
  const bitcoinExchange2Address = "3btc";

  const litecoinCoinbaseAddress = "1ltc";
  const litecoinExchangeAddress = "2ltc";
  const litecoinExchange2Address = "3ltc";

  const ethereumCoinbaseAddress = "1eth";
  const ethereumExchangeAddress = "2eth";
  const ethereumExchange2Address = "3eth";

  const catalog = new crop.Catalog();

  catalog.purchases.push(new crop.Purchase(new Date("11/12/2017"), new crop.Wallet(bitcoinCoinbaseAddress, "BTC", 2), "16000", "USD", "50.50", "USD", "Coinbase"));
  catalog.purchases.push(new crop.Purchase(new Date("11/15/2017"), new crop.Wallet(litecoinCoinbaseAddress, "BTC", 2), "500", "USD", "10.20", "USD", "Coinbase"));
  catalog.purchases.push(new crop.Purchase(new Date("11/25/2017"), new crop.Wallet(bitcoinCoinbaseAddress, "BTC", 2), "120", "USD", "5.50", "USD", "Coinbase"));

  catalog.sales.push(new crop.Sale(new Date("3/2/2018"), new crop.Wallet(bitcoinCoinbaseAddress, "BTC", 1), "18000", "USD", "10", "USD", "Coinbase"));
  catalog.sales.push(new crop.Sale(new Date("3/3/2018"), new crop.Wallet(bitcoinCoinbaseAddress, "BTC", 1), "20000", "USD", "10", "USD", "Coinbase"));
  catalog.sales.push(new crop.Sale(new Date("3/9/2017"), new crop.Wallet(litecoinCoinbaseAddress, "LTC", 2), "300", "USD", "5.20", "USD", "Coinbase"));

  catalog.trades.push();

  catalog.deposits.push();

  catalog.withdrawals.push();

  const reporter = new USAFederalReporter(reportsFolder);
  reporter.generateDocuments(catalog).then(form => {
    console.log('Form created');
  });

  return;

  bitcoin.price().then(price => console.log(`now: ${price}`));
  bitcoin.price('12-15-2017').then(prices => console.log(`12-15-2017: ${bitcoin.pricesAsArray(prices)[0].price}`));

  return;

  //const farmerClasses = [HitBTCFarmer, BittrexFarmer, BinanceFarmer, CoinbaseFarmer, GDAXFarmer]
  const farmerClasses = [HitBTCFarmer];

  const farmers = farmerClasses.filter(clazz => keys[clazz.id()]).map(clazz => new clazz(keys[clazz.id()]));

  Promise.all(farmers.map(farmer => farmer.harvest())).then(values => {
    const byDate = (a,b) => a.date > b.date ? 1 : a.date < b.date ? -1 : 0;
    const flatten = (array) => array.reduce((previous, current) => previous.concat(current));

    const transactions = flatten(values).sort(byDate);
    const firstTransaction = transactions[0];
    const lastTransaction = transactions.slice(-1)[0];

    bitcoin.price(firstTransaction.date, lastTransaction.date)
      .then(prices => {
        console.log(prices);
      });;
  });
}

app();