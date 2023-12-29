# ⚡ SolidQL CLI

There are two scenarios with your contract. Either you <mark style="color:blue;">**haven't deployed your contract yet**</mark>**,** and you plan to do so in the future. In this case, SolidQL can start listening to your contract's emitted events right after you deploy your contract.

Alternatively, if you want to use it for an existing and <mark style="color:blue;">**already deployed contract**</mark>, SolidQL can effortlessly retrieve and index old emitted events with no worries, providing a hassle-free experience.

### SolidQL CLI Options

Effortlessly manage SolidQL in both scenarios by executing the 'solid-ql' command with correct args.

<table><thead><tr><th width="103">Option</th><th width="106">Alt</th><th>Description</th></tr></thead><tbody><tr><td>-w</td><td>--watch</td><td>Watchs for and capture new blockchain events in real-time.</td></tr><tr><td>-s</td><td>--sync</td><td>Index historical events, starting from the <a href="../configuration.md#contracts-config">specified block</a> in the config.</td></tr><tr><td>-c</td><td>--clean</td><td>Clears existing database table schemas before generating new data models.</td></tr><tr><td>-g</td><td>--graph</td><td>Launch the GraphQL server for seamless data querying and exploration.</td></tr></tbody></table>

With the CLI options mentioned above, you now have the flexibility to run SolidQL as you prefer.

{% hint style="success" %}
#### Usage Example

As an example, the following command will **synchronize**, **watch for updates**, and **start the GraphQL** server.

```bash
solid-ql . 
```
{% endhint %}
