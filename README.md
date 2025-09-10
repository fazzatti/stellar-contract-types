#Types Harness

This example is a Soroban types harness. It demonstrates how to encode and invoke different types of SCVal you need from a client, including user defined structs and enums, so wallet and tooling code can learn from real payloads. The contract exposes one function per type, the TypeScript call script simulates first, prints the returned SCVal type and value, and auto funds the source on testnet with friendbot if needed.

## Requirements

- [Deno](https://deno.land/) - Modern runtime for JavaScript and TypeScript
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli/stellar-cli) - The command line interface to Stellar smart contracts

## Setup

1. Copy the environment configuration:

```bash
cp .env.example .env
```

The `.env` is configured by default to use testnet. Feel free to adjust its parameters to use a different target network.

2. Build the contract

```shell
stellar contract build
```

3. Deploy the contract:

```shell
deno task deploy
```

## Usage

Use the following command to simulate an invocation to a given function of the contract:

```shell
deno task call <function name>
```

For example, to simulate an invocation to `vec_address` run:

```shell
deno task call vec_address
```

The script under `./typescript/call.ts` will assemble and parametrize a transaction to invoke this function, then simulate and output the details of the returned value.

The contract source lives at `contracts/types-harness/src/lib.rs`. Below are the exported contract functions you can invoke with `deno task call <function name>`.

Each function is a simple identity/echo for the specified type and is intended for testing how different SCVal types are encoded and returned.
