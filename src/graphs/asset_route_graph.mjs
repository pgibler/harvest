/*

The AssetRouteGraph contains a directed cyclic graph whose nodes
represent asset addresses and whose edges hold a data object
that contains an asset type, asset basis (in Bitcoin), and time sent.

This structure is built by running through a catalog. It iteratively builds the
graph by merging data from new iterations of it into the previous graph.
Each iteration begins with a deposit or purchase.

For each iteration, the deposit or purchase has it's cost basis calculated
and its address extracted, and a node is created if that address does not exist
in the graph whose quantity is the amount of asset deposited or withdrawn.

If it was a purchase, the cost basis is the price of Bitcoin at the time,
otherwise it will be 0.

If the address does exist, the purchase or sale data is merged into the existing
address.

In the context of the deposit or purchase, for each sale, withdrawal, 
and trade, a recursive execution is performed to generate edges containing
the instance fields and the cost basis (in Bitcoin) of the asset contained
in the edge.

When this is done, the system will include coins eligible for long term capital
gains first, if any exist. Otherwise, the newest coins eligible for short term
capital gains are included. All outgoing edges are then recursively recalculated
updating themselves with the new cost basis.

These assumptions represent a simplistic approach
to maximize the potential tax breaks of long term capital gains by giving long
lived assets more time to reach long term capital gains status while churning
through short term capital gains eligible items faster. This approach could be
made more sophisticated to use lookbacks to optimize the tax implications of
asset trading & selling, but this simplistic approach should achieve those goals
to an acceptable enough degree for now.

Once the graph is built, we then generate a list of all sales & transfers.

Those are then used to generate tax documentation.

*/
module.exports = class AssetRouteGraph {
  constructor(catalog) {
    this.catalog = catalog;
  }

  calculateNodes() {
    this.nodes = {};
    this.edges = [];

    // Create address nodes.
    const addWalletAddress = values => {
      values.forEach(value => {
        const address = value.wallet.address;
        if(!this.hasNode(address)) {
          this.addNode(address);
        }
      });
    }

    const addFieldAddresses = (values, fields) => {
      values.forEach(value => {
        fields.forEach(field => {
          const address = value[field];
          if(!this.hasNode(address)) {
            this.addNode(address);
          }
        })
      });
    }

    addWalletAddress(this.catalog.purchases);
    addWalletAddress(this.catalog.sales);
    addWalletAddress(this.catalog.trades);
    addWalletAddress(this.catalog.deposits);
    addWalletAddress(this.catalog.withdrawals);
    addFieldAddresses(this.catalog.trades, ["destination"]);
    addFieldAddresses(this.catalog.deposits, ["destination"]);
    addFieldAddresses(this.catalog.withdrawals, ["destination"]);

    // Create event edges.
    this.catalog.purchases.forEach((purchase, index) => {
      const purchaseNode = this.addNode(`Purchase-${index}`);
      const recipientNode = this.getNode(purchase.wallet.address);
      const edge = this.addEdge(purchase, recipientNode);
      purchaseNode.addEdge(edge);
    });

    this.catalog.sales.forEach((sale, index) => {
      const node = this.getNode(sale.wallet.address);
      const saleNode = this.addNode(`Sale-${index}`);
      const edge = this.addEdge(sale, saleNode);
      node.addEdge(edge);
    });

    this.catalog.trades.forEach((trade, index) => {
      const addressNode = this.getNode(trade.address);
      const destinationNode = this.getNode(trade.destination);
      const edge = this.addEdge(trade, destinationNode);
      addressNode.addEdge(edge);
    });

    this.catalog.deposits.forEach((deposit, index) => {
      const addressNode = this.getNode(deposit.address);
      const destinationNode = this.getNode(deposit.destination);
      const edge = this.addEdge(deposit, destinationNode);
      addressNode.addEdge(edge);
    });

    this.catalog.withdrawals.forEach((withdrawal, index) => {
      const addressNode = this.getNode(withdrawal.address);
      const destinationNode = this.getNode(withdrawal.destination);
      const edge = this.addEdge(withdrawal, destinationNode);
      addressNode.addEdge(edge);
    });

    console.log(`Nodes: ${this.nodes}`);
    console.log(`Edges: ${this.edges}`);
  }

  addEdge(data, receiver) {
    const edge = new Edge(data.type, data, receiver);
    this.edges.push(edge);
    return edge;
  }

  addNode(address) {
    return this.nodes[address] = new Node();
  }

  hasNode(address) {
    return this.nodes[address] != undefined;
  }

  getNode(address) {
    return this.nodes[address];
  }

  getEntryNodes() {
    return Object.values(this.nodes).filter(node => !this.edges.includes(node))
  }
}

class Edge {
  constructor(type, data, receiver) {
    this.type = type;
    this.data = data;
    this.receiver = receiver;
  }
}

class Node {
  constructor() {
    this.edges = [];
  }

  addEdge(edge) {
    this.edges.push(edge);
  }
}