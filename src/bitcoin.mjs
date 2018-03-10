const axios = require('axios')

function current() {
  return new Promise((resolve, reject) => {
    // Current price.
    return axios.get("https://api.coindesk.com/v1/bpi/currentprice.json")
    .then(response => {
      resolve(response.data.bpi.USD.rate.replace(',',''))
    });
  });
}

function price(startDate, endDate) {
  return new Promise((resolve, reject) => {
    if(typeof startDate == 'undefined') {
      return current().then(price => resolve(price));
    }

    if(typeof startDate == 'string') {
      startDate = new Date(startDate);
    }
    if(typeof endDate == 'string') {
      endDate = new Date(startDate);
    }
    if(typeof endDate == 'undefined') {
      endDate = new Date(startDate + 1000*3600*24);
    }
  
    const endDateString = endDate.toISOString().split('T')[0];
    const startDateString = startDate.toISOString().split('T')[0];
    
    // Historical price.
    axios.get(`https://api.coindesk.com/v1/bpi/historical/close.json?start=${startDateString}&end=${endDateString}`)
      .then(response => resolve(response.data.bpi))
      .catch(reject);
  });
}

function pricesAsArray(prices) {
  return Object.keys(prices).map(key => 
    ({ date: key, price: prices[key] })
  )
}

module.exports = {
  current: current,
  price: price,
  pricesAsArray: pricesAsArray
}