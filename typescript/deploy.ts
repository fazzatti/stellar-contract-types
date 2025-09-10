import {
  Account,
  Address,
  Keypair,
  Operation,
  TransactionBuilder,
  xdr,
} from "stellar-sdk";
import {
  getRpc,
  networkEnv,
  sourceAccountSk,
  stellarNetwork,
} from "./config/env.ts";
import { initializeWithFriendbot } from "./utils/initialize-with-friendbot.ts";
import { loadWasmFile } from "./utils/load-wasm.ts";
import { sendTransaction } from "./utils/send-transaction-fn.ts";
import { Buffer } from "buffer";
import { generateRandomSalt } from "./utils/generate-random-salt.ts";
import { highlightText } from "./utils/highlight-text.ts";

const rpc = getRpc();
const sourceKeys = Keypair.fromSecret(sourceAccountSk);

console.log("=============================================");
console.log("Deploying to network:", `${highlightText(networkEnv, "blue")}`);
console.log("=============================================");

let sourceAccount: Account;

console.log("Checking source account:", sourceKeys.publicKey(), "...");
try {
  sourceAccount = await rpc.getAccount(sourceKeys.publicKey());
} catch (_error) {
  console.log("Could not find source account, creating it via friendbot...");
  await initializeWithFriendbot(sourceKeys.publicKey());
  console.log("Account initialized.");
}

try {
  sourceAccount = await rpc.getAccount(sourceKeys.publicKey());
} catch (error) {
  console.error("Error checking source account:", error);
  throw error;
}

const wasm = await loadWasmFile(
  "./target/wasm32v1-none/release/types_harness.wasm"
);

const inclusionFee = 1000;

console.log("Uploading WASM...");
const uploadWasmtx = new TransactionBuilder(sourceAccount, {
  fee: inclusionFee.toString(),
  networkPassphrase: stellarNetwork,
})
  .addOperation(
    Operation.uploadContractWasm({
      wasm,
    })
  )
  .setTimeout(90)
  .build();

const uploadWasmtxPrep = await rpc.prepareTransaction(uploadWasmtx);

uploadWasmtxPrep.sign(sourceKeys);

const uploadResult = await sendTransaction(uploadWasmtxPrep);

const wasmHash = (
  uploadResult.resultMetaXdr
    .v4()
    .sorobanMeta()
    ?.returnValue()
    ?.value() as Buffer
).toString("hex") as string;

console.log("WASM uploaded with hash:", wasmHash);

console.log("Deploying contract...");

const deployTx = new TransactionBuilder(sourceAccount, {
  fee: inclusionFee.toString(),
  networkPassphrase: stellarNetwork,
})
  .addOperation(
    Operation.createCustomContract({
      address: new Address(sourceKeys.publicKey()),
      wasmHash: Buffer.from(wasmHash!, "hex"),
      salt: generateRandomSalt(),
    })
  )
  .setTimeout(90)
  .build();

const deployTxPrep = await rpc.prepareTransaction(deployTx);

deployTxPrep.sign(sourceKeys);

const deployResult = await sendTransaction(deployTxPrep);

const contractId = Address.fromScAddress(
  deployResult.resultMetaXdr
    .v4()
    .sorobanMeta()
    ?.returnValue()
    ?.address() as xdr.ScAddress
).toString();

console.log("Contract deployed with ID:", highlightText(contractId, "blue"));
