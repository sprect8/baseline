# WAKU Hackathon Notes
The original Baseline Reference Implementation (Radish34) demonstrated a decentralised supply chain and procurement solution between a buyer and two suppliers.

Radish34 used the Whisper Protocol for secure, decentralised message transfers between these participants; however as the protocol has since been deprecated, Baseline now relies on NATS. Given the roots of WAKU we believe that we can modify the existing Baseline implementation to run the secure, decentralised messaging protocol on top of WAKU. 

This solution will demonstrate Radish34 operating on top of Waku, extending the existing 

## Setup


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

## Demo and Operations


## Improvements


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
