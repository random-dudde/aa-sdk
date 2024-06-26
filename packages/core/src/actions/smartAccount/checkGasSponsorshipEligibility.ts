import type { Chain, Client, Transport } from "viem";
import type { SmartContractAccount } from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import type { UserOperationStruct } from "../../types.js";
import { buildUserOperation } from "./buildUserOperation.js";
import type {
  SendUserOperationParameters,
  UserOperationContext,
} from "./types";

export const checkGasSponsorshipEligibility: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SendUserOperationParameters<TAccount, TContext>
) => Promise<boolean> = async (client, args) => {
  const { account = client.account } = args;

  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "checkGasSponsorshipEligibility",
      client
    );
  }

  return buildUserOperation(client, args)
    .then((userOperationStruct) =>
      account.getEntryPoint().version === "0.6.0"
        ? (userOperationStruct as UserOperationStruct<"0.6.0">)
            .paymasterAndData !== "0x" &&
          (userOperationStruct as UserOperationStruct<"0.6.0">)
            .paymasterAndData !== null
        : (userOperationStruct as UserOperationStruct<"0.7.0">)
            .paymasterData !== "0x" &&
          (userOperationStruct as UserOperationStruct<"0.7.0">)
            .paymasterData !== null
    )
    .catch(() => false);
};
