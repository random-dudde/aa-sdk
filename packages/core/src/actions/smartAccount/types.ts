import type { Hex, RpcTransactionRequest } from "viem";
import type {
  GetAccountParameter,
  GetEntryPointFromAccount,
  SmartContractAccount,
} from "../../account/smartContractAccount";
import type { UpgradeToData } from "../../client/types";
import type { EntryPointVersion } from "../../entrypoint/types";
import type {
  BatchUserOperationCallData,
  UserOperationCallData,
  UserOperationOverridesParameter,
  UserOperationRequest,
  UserOperationStruct,
} from "../../types";
import type { IsUndefined } from "../../utils";

//#region UpgradeAccountParams
export type UpgradeAccountParams<
  TAccount extends SmartContractAccount | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  upgradeTo: UpgradeToData;
  waitForTx?: boolean;
} & GetAccountParameter<TAccount> &
  GetContextParameter<TContext> &
  UserOperationOverridesParameter<TEntryPointVersion>;
//#endregion UpgradeAccountParams

//#region SendUserOperationParameters
export type SendUserOperationParameters<
  TAccount extends SmartContractAccount | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  uo: UserOperationCallData | BatchUserOperationCallData;
} & GetAccountParameter<TAccount> &
  GetContextParameter<TContext> &
  UserOperationOverridesParameter<TEntryPointVersion>;
//#endregion SendUserOperationParameters

//#region SignUserOperationParameters
export type SignUserOperationParameters<
  TAccount extends SmartContractAccount | undefined =
    | SmartContractAccount
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  uoStruct: UserOperationStruct<TEntryPointVersion>;
} & GetAccountParameter<TAccount>;
//#endregion SignUserOperationParameters

//#region SendTransactionsParameters
export type SendTransactionsParameters<
  TAccount extends SmartContractAccount | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  requests: RpcTransactionRequest[];
} & GetAccountParameter<TAccount> &
  GetContextParameter<TContext> &
  UserOperationOverridesParameter<TEntryPointVersion>;
//#endregion SendTransactionsParameters

//#region DropAndReplaceUserOperationParameters
export type DropAndReplaceUserOperationParameters<
  TAccount extends SmartContractAccount | undefined,
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined,
  TEntryPointVersion extends GetEntryPointFromAccount<TAccount> = GetEntryPointFromAccount<TAccount>
> = {
  uoToDrop: UserOperationRequest<TEntryPointVersion>;
} & GetAccountParameter<TAccount> &
  GetContextParameter<TContext> &
  UserOperationOverridesParameter<TEntryPointVersion>;
//#endregion DropAndReplaceUserOperationParameters

//#region WaitForUserOperationTxParameters
export type WaitForUserOperationTxParameters = {
  hash: Hex;
};
//#endregion WaitForUserOperationTxParameters

//#region BuildUserOperationFromTransactionsResult
export type BuildUserOperationFromTransactionsResult<
  TEntryPointVersion extends EntryPointVersion = EntryPointVersion
> = {
  uoStruct: UserOperationStruct<TEntryPointVersion>;
  batch: BatchUserOperationCallData;
} & UserOperationOverridesParameter<TEntryPointVersion, true>;
//#endregion BuildUserOperationFromTransactionsResult

//#region UserOperationContext
export type UserOperationContext = Record<string, any>;
//#endregion UserOperationContext

//#region GetContextParameter
export type GetContextParameter<
  TContext extends UserOperationContext | undefined =
    | UserOperationContext
    | undefined
> = IsUndefined<TContext> extends true
  ? {
      context?: TContext;
    }
  : { context: TContext };
//#endregion GetContextParameter
