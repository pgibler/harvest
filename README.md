# Harvest

Calculating taxes for cryptocurrency can be hard. Harvest was made to simplify that process.

## Functional synopsis

Harvest ingests data necessary for tax purposes and then generates tax forms based on that data.

The two steps are performed sequentially:

1. Collection of tax relevant data

  There are two main sources of tax relevant data.

  * The user's personally supplied documents to track mining income, payment income, and exchange trade information not accessible via API.
  * Cryptocurrency exchange data accessible via API.

2. Generation of tax document

  The data from step one is used to generate a tax form.

## Features

* Tax report generation
  - The only report currently generator available will generate a [Form 8949](https://www.irs.gov/pub/irs-pdf/f8949.pdf) for your USA federal gains tax.
  - Other countries can be supported.
* Exchange data collection (coming soon)

## Installation

As a package

- `npm install harvest`

From source

1. Checkout the project.
2. Install [pdftk](https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/) for report generation.
3. `cd <checkout direction>`
4. `npm install`

## Usage

1. Fill-in the personal documents with mining income, personal income, and trade information that will not be found on exchanges you link to Harvest.
2. In the `keys.mjs` file, replace the placeholder API keys with your own.
3. Run harvest

  `nodejs harvest.js <args>`

## Notes

### On capital gains

Harvest will generate a Form 8949 containing a summary of your trades and an attachable document compliant with [Exception 2. of Form 8949](https://www.irs.gov/instructions/i8949#idm140253115173088), which states the following:

```
Exception 2.
Instead of reporting each of your transactions on a separate row of Part I or Part II, you can report them on an attached statement containing all the same information as Parts I and II and in a similar format (i.e., description of property, dates of acquisition and disposition, proceeds, basis, adjustment and code(s), and gain or (loss)). Use as many attached statements as you need. Enter the combined totals from all your attached statements on Parts I and II with the appropriate box checked.

For example, report on Part I with box B checked all short-term gains and losses from transactions your broker reported to you on a statement showing basis wasn't reported to the IRS. Enter the name of the broker followed by the words "see attached statement" in column (a). Leave columns (b) and (c) blank. Enter "M" in column (f). If other codes also apply, enter all of them in column (f). Enter the totals that apply in columns (d), (e), (g), and (h). If you have statements from more than one broker, report the totals from each broker on a separate row.

Don't enter "Available upon request" and summary totals in lieu of reporting the details of each transaction on Part I or II or attached statements.
```
