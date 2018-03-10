const pdfFiller = require('pdffiller');
const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');

module.exports = class Form8949 {
  constructor() {
    this.fullName = 'Satoshi Nakamoto';
    this.socialSecurity = '010309';
    
    this.page1TradeType = "0";
    this.page1Trades = [];

    this.page2TradeType = "0";
    this.page2Trades = [];
  }

  setPage1TradeType(type) {
    this.page1TradeType
      = type == "A" ? "1"
      : type == "B" ? "2"
      : type == "C" ? "3" : "0";
  }

  setPage2TradeType(type) {
    this.page2TradeType
      = type == "A" ? "1"
      : type == "B" ? "2"
      : type == "C" ? "3" : "0";
  }

  write(file) {
    return new Promise((resolve, reject) => {
      const retrieveForm = new Promise((rfResolve, rfReject) => {
        const form8949file = path.join(os.tmpdir(), 'form8949.pdf');
        fs.access(form8949file, err => {
          if(err) {
            axios.request({
              url: 'https://www.irs.gov/pub/irs-pdf/f8949.pdf',
              responseType: 'arraybuffer',
              headers: {
                'Content-Type': 'application/pdf'
              }
            }).then(response => {
              fs.writeFileSync(form8949file, response.data);
              rfResolve(form8949file);
            });
          } else {
            rfResolve(form8949file);
          }
        });
      })

      retrieveForm.then(form8949file => {
        const baseData = {
          // Page 1 full name
          "topmostSubform[0].Page1[0].f1_1[0]": this.fullName,
          // Page 1 social security
          "topmostSubform[0].Page1[0].f1_2[0]" : this.socialSecurity,
          // Page 1 radio button
          "topmostSubform[0].Page1[0].c1_1[0]" : this.page1TradeType,
          "topmostSubform[0].Page1[0].c1_1[1]" : this.page1TradeType,
          "topmostSubform[0].Page1[0].c1_1[2]" : this.page1TradeType,
          // Page 2 radio button
          "topmostSubform[0].Page2[0].c2_1[0]" : this.page2TradeType,
          "topmostSubform[0].Page2[0].c2_1[1]" : this.page2TradeType,
          "topmostSubform[0].Page2[0].c2_1[2]" : this.page2TradeType,
          // Page 2 full name
          "topmostSubform[0].Page2[0].f2_1[0]": this.fullName,
          // Page 2 social security
          "topmostSubform[0].Page2[0].f2_2[0]": this.socialSecurity
        };
  
        const tradesDataGenerator = (page, trades) => {
          return trades.reduce((object, trade, index) => {
            object[this.tradeCell(page, index, 0)] = trade.description;
            object[this.tradeCell(page, index, 1)] = trade.dateAcquired;
            object[this.tradeCell(page, index, 2)] = trade.dateSold;
            object[this.tradeCell(page, index, 3)] = trade.proceeds;
            object[this.tradeCell(page, index, 4)] = trade.costBasis;
            object[this.tradeCell(page, index, 5)] = '';
            object[this.tradeCell(page, index, 6)] = '';
            object[this.tradeCell(page, index, 7)] = trade.gains;
      
            return object;
          }, {})
        }
  
        const page1Totals = {
          "topmostSubform[0].Page1[0].f1_115[0]": this.page1Totals.proceeds,
          "topmostSubform[0].Page1[0].f1_116[0]": this.page1Totals.costBasis,
          "topmostSubform[0].Page1[0].f1_117[0]": this.page1Totals.adjustments,
          "topmostSubform[0].Page1[0].f1_118[0]": this.page1Totals.gains,
        }
  
        const page2Totals = {
          "topmostSubform[0].Page2[0].f2_115[0]": this.page2Totals.proceeds,
          "topmostSubform[0].Page2[0].f2_116[0]": this.page2Totals.costBasis,
          "topmostSubform[0].Page2[0].f2_117[0]": this.page2Totals.adjustments,
          "topmostSubform[0].Page2[0].f2_118[0]": this.page2Totals.gains,
        }
  
        const page1TradesData = tradesDataGenerator(1, this.page1Trades);
        const page2TradesData = tradesDataGenerator(2, this.page2Trades);
  
        const data = Object.assign(baseData, page1TradesData, page2TradesData, page1Totals, page2Totals);
  
        pdfFiller.fillForm(form8949file, file, data, function(err) {
          if (err) throw err;
          console.log("In callback (we're done).");
        });
      })
    })
  }

  // Add's a trade to the trade list.
  addPage1Trade(description, dateAcquired, dateSold, proceeds, costBasis, gains) {
    this.page1Trades.push({
      description: description,
      dateAcquired: dateAcquired,
      dateSold: dateSold,
      proceeds: proceeds,
      costBasis: costBasis,
      gains: gains
    });
  }

  addPage2Trade(description, dateAcquired, dateSold, proceeds, costBasis, gains) {
    this.page2Trades.push({
      description: description,
      dateAcquired: dateAcquired,
      dateSold: dateSold,
      proceeds: proceeds,
      costBasis: costBasis,
      gains: gains
    });
  }

  setPage1Totals(proceeds, costBasis, adjustments, gains) {
    this.page1Totals = {
      proceeds: proceeds,
      costBasis: costBasis,
      adjustments: adjustments,
      gains: gains
    }
  }

  setPage2Totals(proceeds, costBasis, adjustments, gains) {
    this.page2Totals = {
      proceeds: proceeds,
      costBasis: costBasis,
      adjustments: adjustments,
      gains: gains
    }
  }

  tradeCell(page, row, column) {
    // The trade list cell at row 0, column 0 is named f1_3 because
    // the first 2 text fields (name and social) use f1_1 & f1_2.
    const fieldCounter = 3;
    const fieldsPerRow = 8;

    const fieldNumber = fieldCounter + column + row * fieldsPerRow;

    return `topmostSubform[0].Page${page}[0].Table_Line1[0].Row${row+1}[0].f${page}_${fieldNumber}[0]`;
  }
}