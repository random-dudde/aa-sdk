import { Address } from "abitype/zod";
import type { Transport } from "viem";
import z from "zod";
import { createPublicErc4337ClientSchema } from "../client/schema.js";
import type { SupportedTransports } from "../client/types";
import { ChainSchema } from "../utils/index.js";

export const SmartAccountProviderOptsSchema = z.object({
  /**
   * The maximum number of times to try fetching a transaction receipt before giving up (default: 5)
   */
  txMaxRetries: z.number().min(0).optional(),

  /**
   * The interval in milliseconds to wait between retries while waiting for tx receipts (default: 2_000)
   */
  txRetryIntervalMs: z.number().min(0).optional(),

  /**
   * The mulitplier on interval length to wait between retries while waiting for tx receipts (default: 1.5)
   */
  txRetryMulitplier: z.number().min(0).optional(),

  /**
   * Used when computing the fees for a user operation (default: 100_000_000n)
   */
  minPriorityFeePerBid: z.bigint().min(0n).optional(),

  /**
   * Percent value for maxPriorityFeePerGas estimate added buffer. maxPriorityFeePerGasBid is set to the max
   * between the buffer "added" priority fee estimate and the minPriorityFeePerBid (default: 33)
   */
  maxPriorityFeePerGasEstimateBuffer: z.number().min(0).optional(),
});

export const createSmartAccountProviderConfigSchema = <
  TTransport extends SupportedTransports = Transport
>() => {
  return z.object({
    rpcProvider: z.union([
      z.string(),
      createPublicErc4337ClientSchema<TTransport>(),
    ]),
    chain: ChainSchema,
    /**
     * Optional entry point contract address for override if needed.
     * If not provided, the entry point contract address for the provider is the connected account's entry point contract,
     * or if not connected, falls back to the default entry point contract for the chain.
     *
     * Refer to https://docs.alchemy.com/reference/eth-supportedentrypoints for all the supported entrypoints
     * when using Alchemy as your RPC provider.
     */
    entryPointAddress: Address.optional(),
    opts: SmartAccountProviderOptsSchema.optional(),
  });
};
