# Solid-QL 🚀
## Query Your Decenteralized Data 

**Solid-QL** is a free and open-source project designed to watch and read EVM-compatible contracts event data. It can store the contract events in a PostgreSQL database and serve the data on a GraphQL interface. The project is easy to integrate into Hardhat or Truffle projects with minimal configurations and a straightforward setup.

## Documentation
For more details, you can refer to the [GitBook documentation](https://masoudrk95.gitbook.io/solid-ql/) or get the package at [Solid-QL npm package](https://www.npmjs.com/package/solid-ql).

## Installation

You can install Solid-QL using npm or yarn. Choose the method that suits you best:

```bash
# Install with npm
npm install --save solid-ql

# Install with yarn
yarn add solid-ql

# Install globally
npm install -g solid-ql
```

## Config 
set up a solid-ql.json file in the root directory of your project. This configuration file holds crucial information for connecting to your PostgreSQL database, specifying contracts, and defining providers. Here's an example solid-ql.json configuration:
```
{
  "store": {
    "url": "postgres://postgres:testuser@localhost:5432/indexer",
    "columnsPrefix": ""
  },
  "graph": {
    "port": 8000
  },
  "contracts": [
    {
      "abi": "../path/to/abi.json",
      "contract": "0x...",
      "network": "sepolia",
      "startBlock": 4673457
    }
  ],
  "providers": {
    "sepolia": {
      "type": "alchemy",
      "key": "..."
    },
    "bsc_test": {
      "type": "json-rpc",
      "rpcUrl": "..."
    }
  }
}
```

## Usage
Run Solid-QL in your project directory:

```bash
solid-ql .
```

## Commands
- -w or --watch: Watch for new blockchain events.
- -s or --sync: Index old events starting from the startBlock parameter in the config file.
- -c or --clean: Clean the database schemas before generating models.
- -g or --graph: Start the GraphQL server.