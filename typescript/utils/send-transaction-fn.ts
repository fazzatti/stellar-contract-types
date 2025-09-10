import { Api } from "stellar-sdk/rpc";
import { getRpc } from "../config/env.ts";
import { FeeBumpTransaction, Transaction } from "stellar-sdk";
import { highlightText } from "./highlight-text.ts";

const rpc = getRpc();

export const sendTransaction = async (
  transaction: Transaction | FeeBumpTransaction
) => {
  try {
    const sendResponse = await rpc.sendTransaction(transaction);

    if (sendResponse.status !== "PENDING") {
      throw new Error(
        `Transaction submission failed with status: ${
          sendResponse.status
        } \n\n ======> ${sendResponse.errorResult?.result().switch().name}\n`
      );
    }

    console.log(
      `Transaction sent! \nHash: ${sendResponse.hash} \nwaiting for confirmation...`
    );

    const finalStatus = await rpc.pollTransaction(sendResponse.hash, {
      sleepStrategy: (_iter: number) => 500,
      attempts: 20,
    });

    switch (finalStatus.status) {
      case Api.GetTransactionStatus.SUCCESS:
        console.log(highlightText("Transaction succeeded!", "green"));
        return finalStatus;

      case Api.GetTransactionStatus.FAILED:
      case Api.GetTransactionStatus.NOT_FOUND:
      default:
        console.log("Transaction failed or not found!");
        throw new Error(
          `Transaction failed with status: ${finalStatus.status}`
        );
    }
  } catch (e) {
    console.log("Something went wrong during transaction submission!");
    // console.log("TX XDR:", transaction.toXDR());
    throw e;
  }
};
