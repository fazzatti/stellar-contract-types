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

- void(env)
- bool(env, bool) -> bool
- u32(env, u32) -> u32
- i32(env, i32) -> i32
- u64(env, u64) -> u64
- i64(env, i64) -> i64
- timepoint(env, Timepoint) -> Timepoint
- duration(env, Duration) -> Duration
- u128(env, u128) -> u128
- i128(env, i128) -> i128
- u256(env, U256) -> U256
- i256(env, I256) -> I256
- bytes(env, Bytes) -> Bytes
- string(env, String) -> String
- symbol(env, Symbol) -> Symbol
- address(env, Address) -> Address
- vec_i128(env, Vec<i128>) -> Vec<i128>
- vec_address(env, Vec<Address>) -> Vec<Address>
- map_sym_i128(env, Map<Symbol, i128>) -> Map<Symbol, i128>
- map_sym_vec_addr(env, Map<Symbol, Vec<Address>>) -> Map<Symbol, Vec<Address>>
- any(env, Val) -> Val
- vec_any(env, Vec<Val>) -> Vec<Val>
- map_sym_any(env, Map<Symbol, Val>) -> Map<Symbol, Val>
- user(env, User) -> User
- choice(env, Choice) -> Choice
- vec_user(env, Vec<User>) -> Vec<User>
- map_addr_user(env, Map<Address, User>) -> Map<Address, User>

Each function is a simple identity/echo for the specified type and is intended for testing how different SCVal types are encoded and returned.
