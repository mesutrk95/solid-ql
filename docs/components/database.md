---
description: >-
  SolidQL seamlessly links event names to table names and event arguments to
  column names in PostgreSQL!
---

# 📒 Database

SolidQL straightforwardly maps event names to table names and event arguments to column names in tables. It stores all data in a PostgreSQL database, automatically converting Solidity types to the corresponding PostgreSQL types.&#x20;

Incoming event data becomes a new data record, but there's more happening – SolidQL adds additional data to the event data record.

{% hint style="success" %}
### Data Mapping Example

Suppose you have the following event in your solidity code:&#x20;

<pre class="language-solidity"><code class="lang-solidity"><strong>event MyCustomEvent(uint256 param1, string param2);
</strong></code></pre>

SolidQL creates a <mark style="color:blue;">**MyCustomEvents**</mark> table and maps <mark style="color:blue;">**param1**</mark> and <mark style="color:blue;">**param2**</mark> arguments to table columns.

Finally, we will have a table as the following:

```css
Table MyCustomEvents
    param1 int8
    param2 string
    indexer_eventId int4
    indexer_contract string
    indexer_network string
    indexer_txHash string
    indexer_blockNumber int4
```
{% endhint %}

### Autio Generated Columns

When you check the automatically generated PostgreSQL tables, you'll notice some columns starting with `indexer_,` These columns are quite useful for tracking the source of data, transaction hash, and more. these are the list of additional columns that SolidQL generates.

<table><thead><tr><th width="209">Column</th><th width="100">Type</th><th>Description</th></tr></thead><tbody><tr><td>indexer_contract</td><td>string</td><td>The address of the contract that emitted the event.</td></tr><tr><td>indexer_network</td><td>string</td><td>The network which event emitted.</td></tr><tr><td>indexer_eventId</td><td>integer</td><td>Auto generated unique eventId based on txHash.</td></tr><tr><td>indexer_txHash</td><td>string</td><td>Emitted event transaction hash.</td></tr><tr><td>indexer_blockNumber</td><td>integer</td><td>Emitted event transaction block number.</td></tr></tbody></table>

{% hint style="info" %}
#### Note

SolidQL includes checks to prevent data duplication in the database, so there's no need to worry about it!&#x20;
{% endhint %}

### Indexed Table Columns

You can manually select which emitted event parameter PostgreSQL should index in the table by adding the **indexed** keyword to the parameter in your event.&#x20;

For example, in the instance below, **param2** will be indexed in the table.

```solidity
event MyCustomEvent(uint256 param1, indexed string param2);
```

Adding indexes to database columns can significantly speed up queries, but we advise against excessive use on a table. While indexes enhance query speed, they can significantly slow down data insertion. Please [**read this article**](https://planetscale.com/blog/what-are-the-disadvantages-of-database-indexes#downsides-of-database-indexes) to understand the implications.

{% hint style="warning" %}
#### Note

Avoid defining too many index columns on your data, as it can slow down SolidQL data insertion.
{% endhint %}

You're all set! Now, you need to set up your [Data Providers](providers.md).
