import type { Chain, Client, Transport } from "viem";
import {
  type GetEntryPointFromAccount,
  type SmartContractAccount,
} from "../../account/smartContractAccount.js";
import { isBaseSmartAccountClient } from "../../client/isSmartAccountClient.js";
import { AccountNotFoundError } from "../../errors/account.js";
import { IncompatibleClientError } from "../../errors/client.js";
import type {
  UserOperationEstimateGasResponse,
  UserOperationStruct,
} from "../../types.js";
import {
  conditionalReturn,
  deepHexlify,
  resolveProperties,
  type Deferrable,
} from "../../utils/index.js";
import type {
  SendUserOperationParameters,
  UserOperationContext,
} from "./types.js";

export async function estimateUserOperationGas<
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
>(
  client: Client<TTransport, TChain, TAccount>,
  args: SendUserOperationParameters<TAccount, TContext>
): Promise<UserOperationEstimateGasResponse<TEntryPointVersion>> {
  const { account = client.account, overrides, uo } = args;
  if (!account) {
    throw new AccountNotFoundError();
  }

  if (!isBaseSmartAccountClient(client)) {
    throw new IncompatibleClientError(
      "BaseSmartAccountClient",
      "estimateUserOperationGas",
      client
    );
  }

  const entryPoint = account.getEntryPoint();

  const callData = Array.isArray(uo)
    ? account.encodeBatchExecute(uo)
    : typeof uo === "string"
    ? uo
    : account.encodeExecute(uo);

  const signature = account.getDummySignature();

  const nonce = account.getNonce(overrides?.nonceKey);

  const struct =
    entryPoint.version === "0.6.0"
      ? ({
          initCode: account.getInitCode(),
          sender: account.address,
          nonce,
          callData,
          signature,
        } as Deferrable<UserOperationStruct<TEntryPointVersion>>)
      : ({
          factory: conditionalReturn(
            account.isAccountDeployed().then((deployed) => !deployed),
            account.getFactoryAddress()
          ),
          factoryData: conditionalReturn(
            account.isAccountDeployed().then((deployed) => !deployed),
            account.getFactoryData()
          ),
          sender: account.address,
          nonce,
          callData,
          signature,
        } as Deferrable<UserOperationStruct<TEntryPointVersion>>);

  const request = deepHexlify(await resolveProperties(struct));

  return await client.estimateUserOperationGas(
    request,
    entryPoint.address,
    overrides?.stateOverride
  );
}
