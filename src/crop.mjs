// All the crops we will harvest.

class Catalog {
  constructor() {
    this.purchases = [];
    this.sales = [];
    this.trades = [];
    this.deposits = [];
    this.withdrawals = [];
  }
}

class Event {
  constructor(date, wallet) {
    this.date = typeof(date) == 'string' ? new Date(date) : date;
    this.wallet = wallet;
  }
}

class Purchase extends Event  {
  constructor(date, wallet, costs, source) {
    super(date, wallet);
    this.costs = costs;
    this.source = source;
    this.type = "Purchase";
  }
}

class Sale extends Event  {
  constructor(date, wallet, costs, source) {
    super(date, wallet);
    this.costs = costs;
    this.source = source;
    this.type = "Sale";
  }
}

class Trade extends Event  {
  constructor(date, wallet, walletDestination, costs, source) {
    super(date, wallet);
    this.walletDestination = walletDestination;
    this.costs = costs;
    this.source = source;
    this.type = "Trade";
  }
}

class Deposit extends Event  {
  constructor(date, wallet, origin, source) {
    super(date, wallet);
    this.origin = origin;
    this.source = source;
    this.type = "Deposit";
  }
}

class Withdrawal extends Event {
  constructor(date, wallet, source) {
    super(date, wallet);
    this.destination = destination;
    this.source = source;
    this.type = "Withdrawal";
  }
}

class Wallet {
  constructor(address, currency, quantity) {
    this.address = address;
    this.currency = currency;
    this.quantity = quantity;
  }
}

class Costs {
  constructor(price, priceCurrency, fee, feeCurrency) {
    this.price = price;
    this.priceCurrency = priceCurrency;
    this.fee = fee;
    this.feeCurrency = feeCurrency;
  }
}

function id(thiz) {
  return `${this.type}-${this.id}`;
}

module.exports = {
  Catalog: Catalog,
  Event: Event,
  Purchase: Purchase,
  Sale: Sale,
  Trade: Trade,
  Deposit: Deposit,
  Withdrawal: Withdrawal,
  Wallet: Wallet,
  Costs: Costs
}