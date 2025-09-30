import {
  Account,
  Keypair,
  nativeToScVal,
  Operation,
  TransactionBuilder,
  xdr,
} from "stellar-sdk";
import {
  contractId,
  getRpc,
  sourceAccountSk,
  stellarNetwork,
} from "./config/env.ts";
import { initializeWithFriendbot } from "./utils/initialize-with-friendbot.ts";
import { Buffer } from "buffer";
import { getArgs } from "./utils/get-args.ts";
import { Api } from "stellar-sdk/rpc";
import { highlightText } from "./utils/highlight-text.ts";
import { sendTransaction } from "./utils/send-transaction-fn.ts";

const rpc = getRpc();
const sourceKeys = Keypair.fromSecret(sourceAccountSk);

const functionName = getArgs(1)[0];

console.log("=============================================");
console.log("Invoking function:", `${highlightText(functionName, "blue")}`);
console.log("=============================================");

let sourceAccount: Account;

console.log("Checking source account:", sourceKeys.publicKey(), "...");
try {
  sourceAccount = await rpc.getAccount(sourceKeys.publicKey());
} catch (_error) {
  console.log("Could not find source account, creating it via friendbot...");
  await initializeWithFriendbot(sourceKeys.publicKey());
  console.log("Account initialized.");

  try {
    sourceAccount = await rpc.getAccount(sourceKeys.publicKey());
  } catch (error) {
    console.error("Error checking source account:", error);
    throw error;
  }
}

const functionArgs: xdr.ScVal[] = [];

switch (functionName) {
  case "void":
    break;

  case "bool":
    functionArgs.push(nativeToScVal(true, { type: "bool" }));
    break;

  case "u32":
    functionArgs.push(nativeToScVal(7, { type: "u32" }));
    break;

  case "i32":
    functionArgs.push(nativeToScVal(-7, { type: "i32" }));
    break;

  case "u64":
    functionArgs.push(nativeToScVal(77n, { type: "u64" }));
    break;

  case "i64":
    functionArgs.push(nativeToScVal(-77n, { type: "i64" }));
    break;

  case "timepoint":
    functionArgs.push(xdr.ScVal.scvTimepoint(new xdr.Uint64(1725000000n)));
    break;

  case "duration":
    functionArgs.push(xdr.ScVal.scvDuration(new xdr.Uint64(3600n)));
    break;

  case "u128":
    functionArgs.push(nativeToScVal(123n, { type: "u128" }));
    break;

  case "i128":
    functionArgs.push(nativeToScVal(-123n, { type: "i128" }));
    break;

  case "u256":
    functionArgs.push(nativeToScVal("0x01", { type: "u256" }));
    break;

  case "i256":
    functionArgs.push(nativeToScVal("0x01", { type: "i256" }));
    break;

  case "bytes":
    functionArgs.push(
      nativeToScVal(Uint8Array.from(Buffer.from("hi")), { type: "bytes" })
    );
    break;

  case "string":
    functionArgs.push(nativeToScVal("hello", { type: "string" }));
    break;

  case "symbol":
    functionArgs.push(nativeToScVal("ok", { type: "symbol" }));
    break;

  case "address":
    functionArgs.push(
      nativeToScVal(sourceKeys.publicKey(), { type: "address" })
    );
    break;

  case "vec_i128":
    functionArgs.push(
      xdr.ScVal.scvVec([
        nativeToScVal(1n, { type: "i128" }),
        nativeToScVal(2n, { type: "i128" }),
        nativeToScVal(3n, { type: "i128" }),
      ])
    );
    break;

  case "vec_address":
    functionArgs.push(
      xdr.ScVal.scvVec([
        nativeToScVal(sourceKeys.publicKey(), { type: "address" }),
        nativeToScVal(sourceKeys.publicKey(), { type: "address" }),
      ])
    );
    break;

  case "map_sym_i128":
    functionArgs.push(
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol("x"),
          val: nativeToScVal(10n, { type: "i128" }),
        }),
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol("y"),
          val: nativeToScVal(20n, { type: "i128" }),
        }),
      ])
    );
    break;

  case "map_sym_vec_addr":
    functionArgs.push(
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol("owners"),
          val: xdr.ScVal.scvVec([
            nativeToScVal(sourceKeys.publicKey(), { type: "address" }),
            nativeToScVal(sourceKeys.publicKey(), { type: "address" }),
          ]),
        }),
      ])
    );
    break;

  case "any":
    functionArgs.push(nativeToScVal("any", { type: "symbol" }));
    break;

  case "vec_any":
    functionArgs.push(
      xdr.ScVal.scvVec([
        nativeToScVal(1n, { type: "i128" }),
        nativeToScVal("any", { type: "symbol" }),
      ])
    );
    break;

  case "map_sym_any":
    functionArgs.push(
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: xdr.ScVal.scvSymbol("k"),
          val: nativeToScVal("any", { type: "symbol" }),
        }),
      ])
    );
    break;

  case "user": {
    const user = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("id"),
        val: nativeToScVal(1, { type: "u32" }),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("name"),
        val: nativeToScVal("Fifo", { type: "string" }),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("tags"),
        val: xdr.ScVal.scvVec([
          nativeToScVal("dev", { type: "symbol" }),
          nativeToScVal("sdk", { type: "symbol" }),
        ]),
      }),
    ]);
    functionArgs.push(user);
    break;
  }

  case "choice": {
    const choice = xdr.ScVal.scvVec([
      xdr.ScVal.scvSymbol("Count"),
      nativeToScVal(9, { type: "u32" }),
    ]);
    functionArgs.push(choice);
    break;
  }

  case "vec_user": {
    const user = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("id"),
        val: nativeToScVal(1, { type: "u32" }),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("name"),
        val: nativeToScVal("Fifo", { type: "string" }),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("tags"),
        val: xdr.ScVal.scvVec([
          nativeToScVal("dev", { type: "symbol" }),
          nativeToScVal("sdk", { type: "symbol" }),
        ]),
      }),
    ]);
    functionArgs.push(xdr.ScVal.scvVec([user]));
    break;
  }

  case "map_addr_user": {
    const user = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("id"),
        val: nativeToScVal(1, { type: "u32" }),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("name"),
        val: nativeToScVal("Fifo", { type: "string" }),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("tags"),
        val: xdr.ScVal.scvVec([
          nativeToScVal("dev", { type: "symbol" }),
          nativeToScVal("sdk", { type: "symbol" }),
        ]),
      }),
    ]);
    functionArgs.push(
      xdr.ScVal.scvMap([
        new xdr.ScMapEntry({
          key: nativeToScVal(sourceKeys.publicKey(), { type: "address" }),
          val: user,
        }),
      ])
    );
    break;
  }

  case "option_u32": {
    const optionMode = getArgs(2, true)[1] || "some"; // "some" or "none"

    functionArgs.push(
      optionMode === "none"
        ? xdr.ScVal.scvVoid()
        : nativeToScVal(42, { type: "u32" })
    );
    break;
  }

  case "option_address": {
    const optionMode = getArgs(2, true)[1] || "some"; // "some" or "none"
    functionArgs.push(
      optionMode === "none"
        ? xdr.ScVal.scvVoid()
        : nativeToScVal(sourceKeys.publicKey(), { type: "address" })
    );
    break;
  }
  case "option_user": {
    const user = xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("id"),
        val: nativeToScVal(1, { type: "u32" }),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("name"),
        val: nativeToScVal("Fifo", { type: "string" }),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol("tags"),
        val: xdr.ScVal.scvVec([
          nativeToScVal("dev", { type: "symbol" }),
          nativeToScVal("sdk", { type: "symbol" }),
        ]),
      }),
    ]);
    const optionMode = getArgs(2, true)[1] || "some"; // "some" or "none"

    functionArgs.push(optionMode === "none" ? xdr.ScVal.scvVoid() : user);
    break;
  }

  default:
    throw new Error(`Function ${functionName} not recognized.`);
}

const inclusionFee = 1000;

const tx = new TransactionBuilder(sourceAccount, {
  fee: inclusionFee.toString(),
  networkPassphrase: stellarNetwork,
})
  .addOperation(
    Operation.invokeContractFunction({
      contract: contractId,
      function: functionName,
      args: functionArgs,
    })
  )
  .setTimeout(90)
  .build();

console.log("Simulating transaction...");
const simulation = await rpc.simulateTransaction(tx).catch((error) => {
  console.error("Error during simulation:", error);
  throw error;
});

if (
  Api.isSimulationSuccess(simulation) ||
  Api.isSimulationRestore(simulation)
) {
  const typeName = simulation.result?.retval.switch().name as string;
  const typeValue = simulation.result?.retval.value()?.toString() as string;

  console.error("Simulation successful!");
  console.log(`Returned value:
    ${highlightText(typeName, "blue")}:
    ${highlightText(typeValue, "green")}
    `);
} else if (Api.isSimulationError(simulation)) {
  console.error("Simulation failed!");
  console.log("Error details:", simulation.error);
}

// Uncomment below to actually send the transaction to the network
//
const preparedTx = await rpc.prepareTransaction(tx);
preparedTx.sign(sourceKeys);
console.log("Sending transaction...");
await sendTransaction(preparedTx);
