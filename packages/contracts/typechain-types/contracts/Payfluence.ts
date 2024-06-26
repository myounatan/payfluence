/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../common";

export declare namespace Payfluence {
  export type AirdropMessageStruct = {
    airdropId: string;
    token: AddressLike;
    owner: AddressLike;
    recipient: AddressLike;
    amountClaimable: BigNumberish;
  };

  export type AirdropMessageStructOutput = [
    airdropId: string,
    token: string,
    owner: string,
    recipient: string,
    amountClaimable: bigint
  ] & {
    airdropId: string;
    token: string;
    owner: string;
    recipient: string;
    amountClaimable: bigint;
  };
}

export interface PayfluenceInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "acceptOwnership"
      | "adminTransferAirdropOwnership"
      | "adminWithdrawERC20"
      | "adminWithdrawNative"
      | "airdropClaimedAmounts"
      | "airdropOwners"
      | "claimAirdrop"
      | "contractBalance"
      | "eip712Domain"
      | "fundERC20"
      | "fundNative"
      | "getBalance"
      | "getChainId"
      | "onERC1155BatchReceived"
      | "onERC1155Received"
      | "onERC721Received"
      | "owner"
      | "pendingOwner"
      | "renounceOwnership"
      | "setAdminAddress"
      | "supportsInterface"
      | "transferOwnership"
      | "verify"
      | "withdrawERC20"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "EIP712DomainChanged"
      | "ERC1155BatchReceived"
      | "ERC1155Received"
      | "ERC20Received"
      | "ERC721Received"
      | "NativeReceived"
      | "OwnershipTransferStarted"
      | "OwnershipTransferred"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "acceptOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "adminTransferAirdropOwnership",
    values: [string, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "adminWithdrawERC20",
    values: [AddressLike, string, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "adminWithdrawNative",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "airdropClaimedAmounts",
    values: [string, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "airdropOwners",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "claimAirdrop",
    values: [BytesLike, Payfluence.AirdropMessageStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "contractBalance",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "eip712Domain",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "fundERC20",
    values: [string, AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "fundNative",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getBalance",
    values: [string, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getChainId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "onERC1155BatchReceived",
    values: [
      AddressLike,
      AddressLike,
      BigNumberish[],
      BigNumberish[],
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC1155Received",
    values: [AddressLike, AddressLike, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC721Received",
    values: [AddressLike, AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "pendingOwner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setAdminAddress",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "verify",
    values: [BytesLike, Payfluence.AirdropMessageStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawERC20",
    values: [string, AddressLike, AddressLike, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "acceptOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "adminTransferAirdropOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "adminWithdrawERC20",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "adminWithdrawNative",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "airdropClaimedAmounts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "airdropOwners",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimAirdrop",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "contractBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "eip712Domain",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "fundERC20", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "fundNative", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getBalance", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getChainId", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "onERC1155BatchReceived",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onERC1155Received",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onERC721Received",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "pendingOwner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setAdminAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "verify", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawERC20",
    data: BytesLike
  ): Result;
}

export namespace EIP712DomainChangedEvent {
  export type InputTuple = [];
  export type OutputTuple = [];
  export interface OutputObject {}
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ERC1155BatchReceivedEvent {
  export type InputTuple = [
    id: string,
    operator: AddressLike,
    from: AddressLike,
    tokenIds: BigNumberish[],
    amounts: BigNumberish[]
  ];
  export type OutputTuple = [
    id: string,
    operator: string,
    from: string,
    tokenIds: bigint[],
    amounts: bigint[]
  ];
  export interface OutputObject {
    id: string;
    operator: string;
    from: string;
    tokenIds: bigint[];
    amounts: bigint[];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ERC1155ReceivedEvent {
  export type InputTuple = [
    id: string,
    operator: AddressLike,
    from: AddressLike,
    tokenIds: BigNumberish,
    amounts: BigNumberish
  ];
  export type OutputTuple = [
    id: string,
    operator: string,
    from: string,
    tokenIds: bigint,
    amounts: bigint
  ];
  export interface OutputObject {
    id: string;
    operator: string;
    from: string;
    tokenIds: bigint;
    amounts: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ERC20ReceivedEvent {
  export type InputTuple = [
    id: string,
    from: AddressLike,
    token: AddressLike,
    amount: BigNumberish
  ];
  export type OutputTuple = [
    id: string,
    from: string,
    token: string,
    amount: bigint
  ];
  export interface OutputObject {
    id: string;
    from: string;
    token: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ERC721ReceivedEvent {
  export type InputTuple = [
    id: string,
    operator: AddressLike,
    from: AddressLike,
    tokenId: BigNumberish
  ];
  export type OutputTuple = [
    id: string,
    operator: string,
    from: string,
    tokenId: bigint
  ];
  export interface OutputObject {
    id: string;
    operator: string;
    from: string;
    tokenId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace NativeReceivedEvent {
  export type InputTuple = [
    id: string,
    from: AddressLike,
    amount: BigNumberish
  ];
  export type OutputTuple = [id: string, from: string, amount: bigint];
  export interface OutputObject {
    id: string;
    from: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferStartedEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface Payfluence extends BaseContract {
  connect(runner?: ContractRunner | null): Payfluence;
  waitForDeployment(): Promise<this>;

  interface: PayfluenceInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  acceptOwnership: TypedContractMethod<[], [void], "nonpayable">;

  adminTransferAirdropOwnership: TypedContractMethod<
    [_airdropId: string, _newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  adminWithdrawERC20: TypedContractMethod<
    [
      _to: AddressLike,
      _airdropId: string,
      _token: AddressLike,
      _amount: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  adminWithdrawNative: TypedContractMethod<
    [_to: AddressLike],
    [void],
    "nonpayable"
  >;

  airdropClaimedAmounts: TypedContractMethod<
    [airdropId: string, recipient: AddressLike],
    [bigint],
    "view"
  >;

  airdropOwners: TypedContractMethod<[airdropId: string], [string], "view">;

  claimAirdrop: TypedContractMethod<
    [signature: BytesLike, airdropMessage: Payfluence.AirdropMessageStruct],
    [void],
    "nonpayable"
  >;

  contractBalance: TypedContractMethod<[id: string], [bigint], "view">;

  eip712Domain: TypedContractMethod<
    [],
    [
      [string, string, string, bigint, string, string, bigint[]] & {
        fields: string;
        name: string;
        version: string;
        chainId: bigint;
        verifyingContract: string;
        salt: string;
        extensions: bigint[];
      }
    ],
    "view"
  >;

  fundERC20: TypedContractMethod<
    [
      _airdropId: string,
      _owner: AddressLike,
      _token: AddressLike,
      _amount: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  fundNative: TypedContractMethod<[], [void], "payable">;

  getBalance: TypedContractMethod<
    [id: string, token: AddressLike],
    [bigint],
    "view"
  >;

  getChainId: TypedContractMethod<[], [bigint], "view">;

  onERC1155BatchReceived: TypedContractMethod<
    [
      arg0: AddressLike,
      arg1: AddressLike,
      arg2: BigNumberish[],
      arg3: BigNumberish[],
      arg4: BytesLike
    ],
    [string],
    "nonpayable"
  >;

  onERC1155Received: TypedContractMethod<
    [
      arg0: AddressLike,
      arg1: AddressLike,
      arg2: BigNumberish,
      arg3: BigNumberish,
      arg4: BytesLike
    ],
    [string],
    "nonpayable"
  >;

  onERC721Received: TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike, arg2: BigNumberish, arg3: BytesLike],
    [string],
    "nonpayable"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  pendingOwner: TypedContractMethod<[], [string], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  setAdminAddress: TypedContractMethod<
    [_adminAddress: AddressLike],
    [void],
    "nonpayable"
  >;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  verify: TypedContractMethod<
    [signature: BytesLike, airdropMessage: Payfluence.AirdropMessageStruct],
    [boolean],
    "view"
  >;

  withdrawERC20: TypedContractMethod<
    [
      _airdropId: string,
      _to: AddressLike,
      _token: AddressLike,
      _amount: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "acceptOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "adminTransferAirdropOwnership"
  ): TypedContractMethod<
    [_airdropId: string, _newOwner: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "adminWithdrawERC20"
  ): TypedContractMethod<
    [
      _to: AddressLike,
      _airdropId: string,
      _token: AddressLike,
      _amount: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "adminWithdrawNative"
  ): TypedContractMethod<[_to: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "airdropClaimedAmounts"
  ): TypedContractMethod<
    [airdropId: string, recipient: AddressLike],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "airdropOwners"
  ): TypedContractMethod<[airdropId: string], [string], "view">;
  getFunction(
    nameOrSignature: "claimAirdrop"
  ): TypedContractMethod<
    [signature: BytesLike, airdropMessage: Payfluence.AirdropMessageStruct],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "contractBalance"
  ): TypedContractMethod<[id: string], [bigint], "view">;
  getFunction(
    nameOrSignature: "eip712Domain"
  ): TypedContractMethod<
    [],
    [
      [string, string, string, bigint, string, string, bigint[]] & {
        fields: string;
        name: string;
        version: string;
        chainId: bigint;
        verifyingContract: string;
        salt: string;
        extensions: bigint[];
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "fundERC20"
  ): TypedContractMethod<
    [
      _airdropId: string,
      _owner: AddressLike,
      _token: AddressLike,
      _amount: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "fundNative"
  ): TypedContractMethod<[], [void], "payable">;
  getFunction(
    nameOrSignature: "getBalance"
  ): TypedContractMethod<[id: string, token: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "getChainId"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "onERC1155BatchReceived"
  ): TypedContractMethod<
    [
      arg0: AddressLike,
      arg1: AddressLike,
      arg2: BigNumberish[],
      arg3: BigNumberish[],
      arg4: BytesLike
    ],
    [string],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "onERC1155Received"
  ): TypedContractMethod<
    [
      arg0: AddressLike,
      arg1: AddressLike,
      arg2: BigNumberish,
      arg3: BigNumberish,
      arg4: BytesLike
    ],
    [string],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "onERC721Received"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike, arg2: BigNumberish, arg3: BytesLike],
    [string],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "pendingOwner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setAdminAddress"
  ): TypedContractMethod<[_adminAddress: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "verify"
  ): TypedContractMethod<
    [signature: BytesLike, airdropMessage: Payfluence.AirdropMessageStruct],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "withdrawERC20"
  ): TypedContractMethod<
    [
      _airdropId: string,
      _to: AddressLike,
      _token: AddressLike,
      _amount: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "EIP712DomainChanged"
  ): TypedContractEvent<
    EIP712DomainChangedEvent.InputTuple,
    EIP712DomainChangedEvent.OutputTuple,
    EIP712DomainChangedEvent.OutputObject
  >;
  getEvent(
    key: "ERC1155BatchReceived"
  ): TypedContractEvent<
    ERC1155BatchReceivedEvent.InputTuple,
    ERC1155BatchReceivedEvent.OutputTuple,
    ERC1155BatchReceivedEvent.OutputObject
  >;
  getEvent(
    key: "ERC1155Received"
  ): TypedContractEvent<
    ERC1155ReceivedEvent.InputTuple,
    ERC1155ReceivedEvent.OutputTuple,
    ERC1155ReceivedEvent.OutputObject
  >;
  getEvent(
    key: "ERC20Received"
  ): TypedContractEvent<
    ERC20ReceivedEvent.InputTuple,
    ERC20ReceivedEvent.OutputTuple,
    ERC20ReceivedEvent.OutputObject
  >;
  getEvent(
    key: "ERC721Received"
  ): TypedContractEvent<
    ERC721ReceivedEvent.InputTuple,
    ERC721ReceivedEvent.OutputTuple,
    ERC721ReceivedEvent.OutputObject
  >;
  getEvent(
    key: "NativeReceived"
  ): TypedContractEvent<
    NativeReceivedEvent.InputTuple,
    NativeReceivedEvent.OutputTuple,
    NativeReceivedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferStarted"
  ): TypedContractEvent<
    OwnershipTransferStartedEvent.InputTuple,
    OwnershipTransferStartedEvent.OutputTuple,
    OwnershipTransferStartedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;

  filters: {
    "EIP712DomainChanged()": TypedContractEvent<
      EIP712DomainChangedEvent.InputTuple,
      EIP712DomainChangedEvent.OutputTuple,
      EIP712DomainChangedEvent.OutputObject
    >;
    EIP712DomainChanged: TypedContractEvent<
      EIP712DomainChangedEvent.InputTuple,
      EIP712DomainChangedEvent.OutputTuple,
      EIP712DomainChangedEvent.OutputObject
    >;

    "ERC1155BatchReceived(string,address,address,uint256[],uint256[])": TypedContractEvent<
      ERC1155BatchReceivedEvent.InputTuple,
      ERC1155BatchReceivedEvent.OutputTuple,
      ERC1155BatchReceivedEvent.OutputObject
    >;
    ERC1155BatchReceived: TypedContractEvent<
      ERC1155BatchReceivedEvent.InputTuple,
      ERC1155BatchReceivedEvent.OutputTuple,
      ERC1155BatchReceivedEvent.OutputObject
    >;

    "ERC1155Received(string,address,address,uint256,uint256)": TypedContractEvent<
      ERC1155ReceivedEvent.InputTuple,
      ERC1155ReceivedEvent.OutputTuple,
      ERC1155ReceivedEvent.OutputObject
    >;
    ERC1155Received: TypedContractEvent<
      ERC1155ReceivedEvent.InputTuple,
      ERC1155ReceivedEvent.OutputTuple,
      ERC1155ReceivedEvent.OutputObject
    >;

    "ERC20Received(string,address,address,uint256)": TypedContractEvent<
      ERC20ReceivedEvent.InputTuple,
      ERC20ReceivedEvent.OutputTuple,
      ERC20ReceivedEvent.OutputObject
    >;
    ERC20Received: TypedContractEvent<
      ERC20ReceivedEvent.InputTuple,
      ERC20ReceivedEvent.OutputTuple,
      ERC20ReceivedEvent.OutputObject
    >;

    "ERC721Received(string,address,address,uint256)": TypedContractEvent<
      ERC721ReceivedEvent.InputTuple,
      ERC721ReceivedEvent.OutputTuple,
      ERC721ReceivedEvent.OutputObject
    >;
    ERC721Received: TypedContractEvent<
      ERC721ReceivedEvent.InputTuple,
      ERC721ReceivedEvent.OutputTuple,
      ERC721ReceivedEvent.OutputObject
    >;

    "NativeReceived(string,address,uint256)": TypedContractEvent<
      NativeReceivedEvent.InputTuple,
      NativeReceivedEvent.OutputTuple,
      NativeReceivedEvent.OutputObject
    >;
    NativeReceived: TypedContractEvent<
      NativeReceivedEvent.InputTuple,
      NativeReceivedEvent.OutputTuple,
      NativeReceivedEvent.OutputObject
    >;

    "OwnershipTransferStarted(address,address)": TypedContractEvent<
      OwnershipTransferStartedEvent.InputTuple,
      OwnershipTransferStartedEvent.OutputTuple,
      OwnershipTransferStartedEvent.OutputObject
    >;
    OwnershipTransferStarted: TypedContractEvent<
      OwnershipTransferStartedEvent.InputTuple,
      OwnershipTransferStartedEvent.OutputTuple,
      OwnershipTransferStartedEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
  };
}
