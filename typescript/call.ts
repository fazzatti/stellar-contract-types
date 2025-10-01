import {
  Account,
  humanizeEvents,
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

function createNestedType(currentDepth: number, width: number): xdr.ScVal {
  const nestedArray = [];

  if (currentDepth > 0) {
    for (let i = 0; i < width; i++) {
      nestedArray.push(createNestedType(currentDepth - 1, width));
    }
  }

  return xdr.ScVal.scvMap([
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("depth"),
      val: nativeToScVal(currentDepth, { type: "u32" }),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("nested"),
      val: xdr.ScVal.scvVec(nestedArray),
    }),
    new xdr.ScMapEntry({
      key: xdr.ScVal.scvSymbol("width"),
      val: nativeToScVal(width, { type: "u32" }),
    }),
  ]);
}

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
    const args = getArgs(2, true);
    const optionMode = args[1];

    if (!optionMode) {
      console.log("⚠️  Please provide option mode argument:");
      console.log("   Usage: deno task call option_u32 <mode>");
      console.log("   Example: deno task call option_u32 some");
      console.log("   Example: deno task call option_u32 none");
      console.log("   - mode: 'some' for Some(42) or 'none' for None");
      Deno.exit(1);
    }

    if (optionMode !== "some" && optionMode !== "none") {
      console.log("⚠️  Invalid option mode. Please use 'some' or 'none'");
      Deno.exit(1);
    }

    functionArgs.push(
      optionMode === "none"
        ? xdr.ScVal.scvVoid()
        : nativeToScVal(42, { type: "u32" })
    );
    break;
  }

  case "option_address": {
    const args = getArgs(2, true);
    const optionMode = args[1];

    if (!optionMode) {
      console.log("⚠️  Please provide option mode argument:");
      console.log("   Usage: deno task call option_address <mode>");
      console.log("   Example: deno task call option_address some");
      console.log("   Example: deno task call option_address none");
      console.log("   - mode: 'some' for Some(address) or 'none' for None");
      Deno.exit(1);
    }

    if (optionMode !== "some" && optionMode !== "none") {
      console.log("⚠️  Invalid option mode. Please use 'some' or 'none'");
      Deno.exit(1);
    }

    functionArgs.push(
      optionMode === "none"
        ? xdr.ScVal.scvVoid()
        : nativeToScVal(sourceKeys.publicKey(), { type: "address" })
    );
    break;
  }
  case "option_user": {
    const args = getArgs(2, true);
    const optionMode = args[1];

    if (!optionMode) {
      console.log("⚠️  Please provide option mode argument:");
      console.log("   Usage: deno task call option_user <mode>");
      console.log("   Example: deno task call option_user some");
      console.log("   Example: deno task call option_user none");
      console.log("   - mode: 'some' for Some(User) or 'none' for None");
      Deno.exit(1);
    }

    if (optionMode !== "some" && optionMode !== "none") {
      console.log("⚠️  Invalid option mode. Please use 'some' or 'none'");
      Deno.exit(1);
    }

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

    functionArgs.push(optionMode === "none" ? xdr.ScVal.scvVoid() : user);
    break;
  }

  case "nested_type": {
    const args = getArgs(3, true);
    const depth = args[1] ? parseInt(args[1]) : null;
    const width = args[2] ? parseInt(args[2]) : null;

    if (depth === null || width === null || isNaN(depth) || isNaN(width)) {
      console.log("⚠️  Please provide depth and width arguments:");
      console.log("   Usage: deno task call nested_type <depth> <width>");
      console.log("   Example: deno task call nested_type 2 3");
      console.log(
        "   - depth: how deep the nesting goes (e.g., 2 = nested.nested)"
      );
      console.log(
        "   - width: how many items in each array layer (e.g., 3 = 3 items per level)"
      );
      Deno.exit(1);
    }

    const nestedType = createNestedType(depth, width);
    functionArgs.push(nestedType);
    break;
  }

  case "flatten_nested_type": {
    const args = getArgs(3, true);
    const depth = args[1] ? parseInt(args[1]) : null;
    const width = args[2] ? parseInt(args[2]) : null;

    if (depth === null || width === null || isNaN(depth) || isNaN(width)) {
      console.log("⚠️  Please provide depth and width arguments:");
      console.log(
        "   Usage: deno task call flatten_nested_type <depth> <width>"
      );
      console.log("   Example: deno task call flatten_nested_type 2 3");
      console.log(
        "   - depth: how deep the nesting goes (e.g., 2 = nested.nested)"
      );
      console.log(
        "   - width: how many items in each array layer (e.g., 3 = 3 items per level)"
      );
      Deno.exit(1);
    }

    const nestedType = createNestedType(depth, width);
    functionArgs.push(nestedType);
    break;
  }

  case "fail":
    functionArgs.push(xdr.ScVal.scvBool(true));
    break;

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
  console.log("Simulation failed! Checking error details...");

  // Check the inner contract events for more details
  const events = humanizeEvents(simulation.events);
  const contractEvents = events.filter(
    (e) => e.contractId === contractId && e.topics[0] === "error"
  );

  // Look for the error code we set in the contract
  // 123 = Error::FailedWithCustomError
  // This is the expected error for the `fail` function
  //  - If we find it, we consider the test successful
  //  - If not, we consider it a failure
  const contractError = contractEvents.find((e) => e.topics[1].code === 123);
  if (contractError) {
    console.log("Expected contract error detected:", contractError);
    console.log(highlightText("handling it gracefully!\n", "blue"));
    Deno.exit(0);
  }

  console.error(highlightText("No expected error found. Aborting! \n", "red"));
  Deno.exit(1);
}

const preparedTx = await rpc.prepareTransaction(tx);
preparedTx.sign(sourceKeys);
console.log("Sending transaction...");
await sendTransaction(preparedTx);
