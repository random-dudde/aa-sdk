---
outline: deep
head:
  - - meta
    - property: og:title
      content: How to estimate gas of a user operation involving state overrides
  - - meta
    - name: description
      content: Follow this guide to learn how to estimate gas of a user operation involving state overrides using Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - property: og:description
      content: Follow this guide to learn how to estimate gas of a user operation involving state overrides using Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
  - - meta
    - name: twitter:title
      content: How to estimate gas of a user operation involving state overrides
  - - meta
    - name: twitter:description
      content: Follow this guide to learn how to estimate gas of a user operation involving state overrides using Account Kit, a vertically integrated stack for building apps that support ERC-4337 and ERC-6900.
---

# How to estimate gas of a user operation involving state overrides

## [`StateOverride`](/resources/types#StateOverride)

State overrides allow you to customize the network state for the purpose of your simulation. This feature is useful when you need to simulate or estimate gas for transaction scenarios under conditions that are not currently present on the live network.

To illustrate how state overrides work, let’s use the DAI stablecoin contract. In the DAI system, certain actions, like minting new DAI tokens, can only be performed by addresses designated as "wards". If your address is not a ward, you cannot test minting operations.

### Setting up as a ward through state overrides

To estimate gas for the user operation transaction, you need to simulate a transaction where you mint DAI. This requires overriding the state to make our address appear as a ward. In other words, you need to pass in the state overrides value, along with the user operation transaction data, to adjust the wards map in the DAI contract to include your address with the necessary permissions.

The state override is a mapping of specific storage locations in the smart contract as keys of the map, pointing to the override values for the simulation.

```ts
{
  stateOverrides: {
    "0xDAI_CONTRACT_ADDRESS": {
      storage: {
        "0xSTORAGE_SLOT_OF_YOUR_ADDRESS": "0x0000000000000000000000000000000000000000000000000000000000000001"
      }
    }
  }
}
```

::: tip Storage Slot Calculation
Calculating the storage location depends on the structure of the contract’s storage and the specific variable you want to override. For the DAI contract example, the storage location for the wards mapping for your address is calculated based on the [Solidity storage layout rules](https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html#mappings-and-dynamic-arrays):

```ts
const yourAddress = "0x...";
const overrideStorageLocation = keccak256(
  concatenate(hexZeroPad(yourAddress), hexZeroPad(0x0))
); // 0xSTORAGE_SLOT_OF_YOUR_ADDRESS
```

:::

## Simulated user operation gas estimation using `SmartAccountClient`

[`eth_estimateUserOperationGas`](https://docs.alchemy.com/reference/eth-estimateuseroperationgas) is an RPC method that bundlers support as per the [`ERC-4337`](https://eips.ethereum.org/EIPS/eip-4337#-eth_estimateuseroperationgas) specification. It estimate the gas values for a UserOperation. Given a UserOperation, optionally without gas limit or price fields, this method returns the needed gas limits.

`SmartAccountClient` of `aa-sdk` provides default [`gasEstimator`](/packages/aa-core/smart-account-client/middleware/index#gasEstimator) that internally includes calling `eth_estimateUserOperationGas` to the bundler in addition to applying user operation overrides or fee options for populating the user operation gas fields in a most desired mannder. If you are looking to estimate gas of a user operation without building the entire user operation through the middleware pipeline, you can call the [`estimateUserOperationGas`](/packages/aa-core/smart-account-client/actions/estimateUserOperationGas) action on the `SmartAccountClient` to directly fetch network user operation gas estimates from the bundler. The action returns `UserOperationEstimateGasResponse` containing the estimated gas values.

::: tip Note 1
The actual gas estimation or fee estimation is performed by the bundler connected to the `SmartAccountClient`, so depending on the bundler you are using, the gas estimate value might be different.
:::

::: tip Note 2
Note that the `estimateUserOperationGas` action returns the bare result of gas estimates returned directly from the connected bundler without applying user operation gas overrides or client fee options that are applied from the default `gasEstimator` used when constructing the actual user operation request to send to the network.
:::

### [`UserOperationEstimateGasResponse`](/resources/types#useroperationrstimategasresponse)

```ts
export interface UserOperationEstimateGasResponse<
  TEntryPointVersion extends EntryPointVersion
> {
  /* Gas overhead of this UserOperation */
  preVerificationGas: BigNumberish;
  /* Actual gas used by the validation of this UserOperation */
  verificationGasLimit: BigNumberish;
  /* Value used by inner account execution */
  callGasLimit: BigNumberish;
  /*
   * EntryPoint v0.7.0 operations only.
   * The amount of gas to allocate for the paymaster validation code.
   * Note: `eth_estimateUserOperationGas` does not return paymasterPostOpGasLimit.
   */
  paymasterVerificationGasLimit: TEntryPointVersion extends "0.7.0"
    ? BigNumberish
    : never;
}
```

### Example

::: code-group

```ts [example.ts]
import { smartAccountClient } from "./smartAccountClient";

// [!code focus:99]
const { preVerificationGas, verificationGasLimit, callGasLimit } =
  await smartAccountClient.estimateUserOperationGas({
    uo: [
      {
        target: "0x...",
        data: "0xcallDataTransacation1",
      },
      {
        target: "0x...",
        data: "0xcallDataTransacation2",
      },
    ],
  });
```

<<< @/snippets/aa-alchemy/connected-client.ts [smartAccountClient.ts]

:::
