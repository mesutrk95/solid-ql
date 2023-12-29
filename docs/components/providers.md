---
description: SolidQL integrates with Alchemy, Infura, and JsonRPC as data providers!
---

# 📦 Providers

SolidQL supports **Alchemy**, **Infura**, and **JsonRPC** as data providers. In the configuration file, you need to specify these providers. Since SolidQL supports multiple chains, you should define all the providers for each network where contracts are deployed.

{% hint style="warning" %}
#### Important Note!

Make sure to choose the right data providers for the networks!

For instance, as of the current documentation, Alchemy does not support Binance Smart Chain. Therefore, you **cannot** select <mark style="color:blue;">Alchemy</mark> as the provider for the <mark style="color:blue;">Binance Smart Chain</mark> network. Instead, opt for JsonRPC as the provider for contracts deployed on the Binance Smart Chain.
{% endhint %}

Certainly, you should obtain keys for **Alchemy** or **Infura** by following these steps.

* For <mark style="color:purple;">**Alchemy**</mark>, visit their [website](https://www.alchemy.com/) and follow the sign-up process to obtain your API key.
* For <mark style="color:red;">**Infura**</mark>, go to their [website](https://www.infura.io/) and create an account to generate your API key.

Remember to keep your API keys **secure** and **never share them publicly**. These keys are essential for connecting SolidQL to external data providers and ensuring smooth operation.

Once you have obtained a key from the providers, SolidQL is ready to handle your data!&#x20;
