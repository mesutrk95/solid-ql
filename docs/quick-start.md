---
description: Dive into the world of SolidQL!
---

# 🚀 Quick Start

### Installation

You can install SolidQL using npm or yarn. Choose the method that suits you best:

```bash
# Install with npm
npm install --save solid-ql

# Install with yarn
yarn add solid-ql

# Install globally
npm install -g solid-ql
```

### Configuration

Create a `solid-ql.json` file in the <mark style="color:blue;">**root directory**</mark> of your project. This configuration file holds crucial information for connecting to your PostgreSQL database, specifying contracts, and defining network data providers.&#x20;

Here's an example solid-ql.json configuration:

```json
{
  "store": {
    "url": "postgres://postgres:testuser@localhost:5432/indexer"
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
    }
  }
}
```

### Usage

Run Solid-QL in your project directory:

```bash
solid-ql .
```

SolidQL now starts indexing the past events that have already been emitted from listed contracts and it also listens for new events by subscribing to the networks.

The GraphQL endpoint will start at [http://localhost:8000/graphql](http://localhost:8000/graphql) by default. Check your GraphQL endpoint now to start accessing your decentralized data! [🎉](https://emojipedia.org/party-popper)

Now let's take a closer look at `solid-ql.json` config file in the next section.
