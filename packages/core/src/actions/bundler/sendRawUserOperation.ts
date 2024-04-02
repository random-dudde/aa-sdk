import type { Address, Chain, Client, Hex, Transport } from "viem";
import type { BundlerRpcSchema } from "../../client/decorators/bundlerClient";
import type { EntryPointVersion } from "../../entrypoint/types";
import type { UserOperationRequest } from "../../types";

export const sendRawUserOperation = async <
  TEntryPointVersion extends EntryPointVersion,
  TClient extends Client<Transport, Chain | undefined, any, BundlerRpcSchema>
>(
  client: TClient,
  args: {
    request: UserOperationRequest<TEntryPointVersion>;
    entryPoint: Address;
  }
): Promise<Hex> => {
  return client.request({
    method: "eth_sendUserOperation",
    params: [args.request, args.entryPoint],
  });
};
