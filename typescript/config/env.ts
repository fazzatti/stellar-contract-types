import { Networks } from "@stellar/stellar-sdk";
import { highlightText } from "../utils/highlight-text.ts";
import { Server } from "stellar-sdk/rpc";

export function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) {
    console.error(
      highlightText(
        `Error: Environment variable ${key} is not set.\nCheck the 'Setup' section of the README.md file.`,
        "red"
      )
    );

    throw new Error(`Required environment variable ${key} is not set. `);
  }
  return value;
}

export function getOptionalEnv(key: string): string | undefined {
  return Deno.env.get(key);
}

export const networkEnv = getRequiredEnv("NETWORK").toLowerCase();

const networkKey =
  networkEnv === "mainnet" ? "PUBLIC" : networkEnv.toUpperCase();

if (!(networkKey in Networks)) {
  throw new Error(
    `Invalid NETWORK value: ${networkEnv}. Must be one of: ${Object.keys(
      Networks
    )
      .join(", ")
      .toLowerCase()}`
  );
}
export const stellarNetwork = Networks[networkKey as keyof typeof Networks];
export const sourceAccountSk = getRequiredEnv("SOURCE_ACCOUNT_SK");
export const contractId = getRequiredEnv("CONTRACT_ID");

export const getFriendbotUrl = () => {
  switch (stellarNetwork) {
    case Networks.TESTNET:
      return "https://friendbot.stellar.org";
    case Networks.FUTURENET:
      return "https://friendbot-futurenet.stellar.org";
    case Networks.STANDALONE:
      return "http://localhost:8000/friendbot";
    case Networks.PUBLIC:
    case Networks.SANDBOX:

    default:
      throw new Error(
        `Friendbot is not defined for the ${stellarNetwork} network.`
      );
  }
};

export const getRpc = () => {
  return new Server(getRequiredEnv("STELLAR_RPC_URL"), { allowHttp: true });
};
