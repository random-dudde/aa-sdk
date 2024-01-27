import type { Chain, Transport } from "viem";
import type {
  GetAccountParameter,
  SmartContractAccount,
} from "../../../account/smartContractAccount";
import type { BaseSmartAccountClient } from "../../../client/smartAccountClient";
import type {
  UserOperationOverrides,
  UserOperationStruct,
} from "../../../types";
import { resolveProperties, type Deferrable } from "../../../utils/index.js";

const asyncPipe =
  <S, Opts>(...fns: ((s: S, opts: Opts) => Promise<S>)[]) =>
  async (s: S, opts: Opts) => {
    let result = s;
    for (const fn of fns) {
      result = await fn(result, opts);
    }
    return result;
  };

export const _runMiddlewareStack: <
  TTransport extends Transport = Transport,
  TChain extends Chain | undefined = Chain | undefined,
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined
>(
  client: BaseSmartAccountClient<TTransport, TChain, TAccount>,
  args: {
    uo: Deferrable<UserOperationStruct>;
    overrides?: UserOperationOverrides;
  } & GetAccountParameter<TAccount>
) => Promise<UserOperationStruct> = async (client, args) => {
  const { uo, overrides, account = client.account } = args;
  if (!account) {
    throw new Error("No account set on client");
  }

  const result = await asyncPipe(
    client.middleware.dummyPaymasterAndData,
    client.middleware.feeEstimator,
    client.middleware.gasEstimator,
    client.middleware.custom,
    // TODO: need to handle the paymaster and data override here
    client.middleware.paymasterAndData,
    client.middleware.userOperationSimulator
  )(uo, { overrides, feeOptions: client.feeOptions, account });

  return resolveProperties<UserOperationStruct>(result);
};