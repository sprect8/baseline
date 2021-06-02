# WAKU Hackathon Notes
The Baseline Protocol combines advances in cryptography, messaging and blockchain to deliver secure and private business processes at low cost on the public main-net. The protocol enables confidential and complex collaboration between enterprises without moving any sensitive data from traditional systems of records. Officially Baseline is managed by the OASIS foundation and originally contributed by ConsenSys, Microsoft and Ernst & Young (For some background information, check out [this section](https://docs.baseline-protocol.org/baseline-protocol/the-baseline-protocol))

The original Baseline Reference Implementation (Radish34) demonstrated a decentralised supply chain and procurement solution between a buyer and two suppliers.

Radish34 originally used the Whisper Protocol for secure, decentralised message transfers between these participants; however as the protocol has since been deprecated, Baseline now relies on NATS. Given the roots of WAKU we believe that we can modify the existing Baseline implementation to run the secure, decentralised messaging protocol on top of WAKU. 

This solution will demonstrate Radish34 operating on top of Waku, extending the existing protocol to include WAKU specific implementations. We will demonstrate the following
- Upgrade the Radish34 demonstration to include WAKU bindings
- Extend the Messaging Provider microservice to support WAKU
- Demonstrate end-to-end process flow for a procurement activity using WAKU and Baseline. 

## Justification and Value
The existing functionality relies on NATS which is an additional set of services that are required to run Baseline between two enterprises. This raises the barrier of entry and adds complexity to hosting and management.

Originally Baseline used a completely decentralised messaging bus (Whisper) which has since been deprecated. We believe that WAKU can be used in place of Whisper to achieve the same outcome. Given its goals as a P2P decentralised messaging platform, we feel that WAKU is a perfect fit for the Baseline messaging protocol.

## Setup
To run this demonstration, you will need a lot of ram, hard drive space, fast internet connection and a lot of patience! First, checkout this source code and follow the instructions in the examples/radish34 README. 

1. cd examples/radish34
2. make (this take a long time as the Zero-Knowledge circuits are generated)
3. make start
4. ./rebuild.sh (this will rebuild the package to inject our WAKU provider into the sample code)
5. npm run deploy (this will deploy the necessary smart contracts and account details into the platform)
6. make test (this will run the integration tests)

Generally this whole process takes around 30 minutes depending on your machine and internet connection speed. 

If your setup was successful then the integration tests will pass and you can view the results in the underlying User Interface (running on http://localhost:3000). 

### Special configuration
The messenger service imports `@baseline-protocol/messaging` npm package. If you want to make modifications to the package's source code, you can edit the files in `<repo_root>/baseline/core/messaging`. For a local node process to use those files instead of importing the npm package from a remote registry, you can create an `npm link`:
```
cd <repo_root>/baseline/core/messaging
npm link
cd ../../examples/radish34/messenger
npm link @baseline-protocol/messaging
npm ls -g --depth=0 --link=true
npm install --link
```
To remove the npm link use the following command:
```
npm unlink @baseline-protocol/messaging -g 
```

The above configuration is managed for you in the rebuild.sh script in the radish34 directory.

## Demo and Operations
If you have a WAKU chat client handy, connect it to the 0x11223344 and you can see the history of all messages sent during demo purposes. (see ![waku transactions](waku.transactions.txt) for example transaction set).

Please also visit the youtube link for a brief walkthrough of the project.



## Improvements and Next Steps
### Encryption and Channel Management ###
The channel is hard-coded to 0x11223344. This is not ideal for any production setting. Furthermore all messages are now un-encrypted which is definitely not what we want. Whisper originally encrypted the data that flowed between enterprises. We would propose a handshake step before the Enterprises can connect, which would include setting up a channel for Enterprises to listen on for Baseline registration messages, and then establishing another channel for discussion between parties (with appropriate encryption)

At the moment, if you point the WAKU web-chat to development endpoints on channel 0x11223344 you can see a history of all the messages passed between the platform (in un-encrypted form). 

### Integrate with other Baseline Reference Implementations ###
Baseline implementations (BRI-1 and BRI-2) currently use NATS to manage the messaging. NATS is quite tightly integrated with these examples (hence we chose to integrate with radish34 instead). Decouple NATS integration and replace with configurable option to include WAKU as part of the messaging protocol for the reference implementations. 


### Integrate into Baseline Repository ###
After integrating with BRI-1 and BRI-2 work with the OASIS and Baseline folks to issue a PR and add this work into the Baseline Repository ([`core/`](https://github.com/ethereum-oasis/baseline/)). This involves updates to a few key modules (baseline-messaging, bri-1, bri-2 and radish34).


# Baseline Protocol

<div align="center">
  <img alt="Baseline" src="docs/assets/baseline-logo/Web/examples/PNGs/horizontal/baselineHorizontal-Logo-FullColor.png" />
  <p>
    Combining advances in cryptography, messaging, and blockchain to execute
    <br/>
    secure and private business processes via the public Ethereum Mainnet.
  </p>
  Read the full documentation <a href="https://docs.baseline-protocol.org">here at docs.baseline-protocol.org</a>.
  <p>
    <em>Join our <a href="https://communityinviter.com/apps/ethereum-baseline/join-us">Slack workspace</a>, <a href="https://discord.gg/NE8AYD7">Discord channel</a>, <a href="https://t.me/baselineprotocol">Telegram channel</a> and follow us on <a href="https://twitter.com/baselineproto">Twitter</a> for Baseline news and updates!</em>
  </p>
  <br/>
</div>

## Baseline Protocol Release `v0.1.0`

Version 0.1 of the baseline protocol packages has been released! For some background information, check out [this section](https://docs.baseline-protocol.org/baseline-protocol/the-baseline-protocol) of our docs. There are two entrypoints where you can get involved in the codebase:
- [`core/`](https://github.com/ethereum-oasis/baseline/tree/master/core) -- the "core" Baseline Protocol packages
- [`examples/bri-1`](https://github.com/ethereum-oasis/baseline/tree/master/examples/bri-1/base-example) -- the BRI-1 reference implementation.
One or more "core" baseline protocol packages are needed to baseline-enable applications and systems of record.

## Core Modules & Packages
| Package | Source Path | Description |
| -------- | ----- | ----------- |
| `@baseline-protocol/api` | `core/api` | Core *baseline* API package providing unified access to the `baseline` JSON-RPC module and blockchain, registry and key management interfaces |
| `@baseline-protocol/contracts` | `core/contracts` | Solidity contracts packaged as a Truffle project; includes ERC1820/organization registry |
| `@baseline-protocol/messaging` | `core/messaging` | Core messaging package with protocol-agnostic p2p interface with NATS and Whisper implementations |
| `@baseline-protocol/persistence` | `core/persistence` | Persistence package; this is a placeholder for system of record integration standards (see ERP connector projects under `examples/`) |
| `@baseline-protocol/privacy` | `core/privacy` | Core privacy package initially exposing a zkSnark circuit provider factory; designed to support future privacy implementations |
| `@baseline-protocol/types` | `core/types` | Core reuseable type definitions; also provides a convenience wrapper around interacting with `lib/` assets (i.e. circuits) |

## Architecture
![baseline-protocol-architecture](https://user-images.githubusercontent.com/161261/86484557-79504f00-bd24-11ea-8edb-d665cb55db20.png)

## License

All code in this repo is released under the CC0 1.0 Universal public domain dedication. For the full license text, refer to [LICENSE](LICENSE).

## Contributing

See [our contributing guidelines](CONTRIBUTING.md)
