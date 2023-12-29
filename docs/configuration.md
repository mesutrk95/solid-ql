---
description: SolidQL offers clear instructions for setting up the services quickly!
---

# 🛠 Configuration

The SolidQL configuration file, named `solid-ql.json` needs to be placed at the root of your project directory. It includes four main configurations, as shown below.

```json
// solid-ql.json
{    
    // deployed contracts configuration
    "contracts": [],

    // postgres database configuration
    "store": {},
    
    // graphql server configuration
    "graph": {},
    
    // blockchain data providers configuration
    "providers": {}
} 
```

### 📄 Contracts Config

You can deploy multiple contracts on various networks, and you're permitted to list them in the contracts section here.

<table data-full-width="false"><thead><tr><th width="166">Key</th><th>Description</th><th width="137">Requried</th><th width="100">Default</th></tr></thead><tbody><tr><td>abi</td><td>Path to the contract's ABI json file</td><td>Yes</td><td></td></tr><tr><td>contract</td><td>Ethereum contract address</td><td>Yes</td><td></td></tr><tr><td>network</td><td>Ethereum network name</td><td>Yes</td><td></td></tr><tr><td>startBlock</td><td>Block number to start indexing from</td><td>Yes</td><td>0</td></tr></tbody></table>

### 🗃️ Database Config

For more information, you can navigate to the [Database](components/database.md) page.

<table data-full-width="false"><thead><tr><th width="211">Key</th><th>Description</th><th width="178">Required</th><th width="100">Default</th></tr></thead><tbody><tr><td>url</td><td>PostgreSQL connection URL</td><td>Yes</td><td></td></tr><tr><td>solidQlColumnsPrefix</td><td>Prefix for SolidQL generated columns (this prefix won't be applied on  your event name based columns)</td><td>No</td><td>"indexer"</td></tr></tbody></table>

### 🎨 GraphQL Config

For more information, you can navigate to the [GraphQL](components/graphql.md) page.

<table data-full-width="false"><thead><tr><th width="173">Key</th><th width="315">Description</th><th width="100">Required</th><th>Default</th></tr></thead><tbody><tr><td>port</td><td>GraphQL server port</td><td>No</td><td>8000</td></tr><tr><td>apiPath</td><td>GraphQL api path prefix</td><td>No</td><td>"graphql"</td></tr></tbody></table>

### 🔌 Providers Config

Based on the networks where you've deployed your contracts, it's important to have a corresponding provider to retrieve data from those contracts. For more information, you can go to the [Providers](configuration.md#providers-config) page.

{% hint style="info" %}
#### **Example**

For instance, if you've deployed on the Sepolia test network, you should consider setting up a Sepolia network provider to fetch event data from the deployed contracts.

```json
{
    "contracts": [
        {
            "network": "sepolia",
            ... 
        }
    ],
    "providers": {
        "sepolia": {
            "type": "alchemy", // json-rpc, alchemy, ...
            "key": "your-alchemy-key"
        },
        
    }
}
```
{% endhint %}

SolidQL currently supports **JsonRPC**, **Infura**, and **Alchemy** providers, and in the future, it will support additional providers. To begin, you need to choose a provider type from these options. Afterward, based on the chosen type, you have to provide additional about that provider.

#### Alchemy Provider

```json
{
    type: "alchemy",
    key: "your-alchemy-provider-key"
}
```

**Infura Provider**

```json
{
    type: "infura",
    key: "your-infura-provider-key"
}
```

#### JsonRPC

```
{
    type: "json-rpc",
    key: "https://json-rpc-endpoint-url.com/"
}
```

