/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  Tipping,
  TippingInterface,
} from "../../../contracts/TippingAndAirdrop.sol/Tipping";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "notAuthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "notEnoughValue",
    type: "error",
  },
  {
    inputs: [],
    name: "transferFailed",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "TipSent",
    type: "event",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "sendTip",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506106bc806100606000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80638da5cb5b1461003b578063b86255eb14610059575b600080fd5b610043610075565b60405161005091906102c4565b60405180910390f35b610073600480360381019061006e919061049b565b610099565b005b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461011e576040517fd264e0ae00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008211610158576040517f2211d12b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60008473ffffffffffffffffffffffffffffffffffffffff166323b872dd3386866040518463ffffffff1660e01b81526004016101979392919061052d565b6020604051808303816000875af11580156101b6573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101da919061059c565b905080610213576040517fe465903e00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b8373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f83f488cec92e3d553fa223a59ca287494047278eb0c3a08363b0a125dd143b9085888660405161027493929190610648565b60405180910390a35050505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006102ae82610283565b9050919050565b6102be816102a3565b82525050565b60006020820190506102d960008301846102b5565b92915050565b6000604051905090565b600080fd5b600080fd5b6102fc816102a3565b811461030757600080fd5b50565b600081359050610319816102f3565b92915050565b6000819050919050565b6103328161031f565b811461033d57600080fd5b50565b60008135905061034f81610329565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6103a88261035f565b810181811067ffffffffffffffff821117156103c7576103c6610370565b5b80604052505050565b60006103da6102df565b90506103e6828261039f565b919050565b600067ffffffffffffffff82111561040657610405610370565b5b61040f8261035f565b9050602081019050919050565b82818337600083830152505050565b600061043e610439846103eb565b6103d0565b90508281526020810184848401111561045a5761045961035a565b5b61046584828561041c565b509392505050565b600082601f83011261048257610481610355565b5b813561049284826020860161042b565b91505092915050565b600080600080608085870312156104b5576104b46102e9565b5b60006104c38782880161030a565b94505060206104d48782880161030a565b93505060406104e587828801610340565b925050606085013567ffffffffffffffff811115610506576105056102ee565b5b6105128782880161046d565b91505092959194509250565b6105278161031f565b82525050565b600060608201905061054260008301866102b5565b61054f60208301856102b5565b61055c604083018461051e565b949350505050565b60008115159050919050565b61057981610564565b811461058457600080fd5b50565b60008151905061059681610570565b92915050565b6000602082840312156105b2576105b16102e9565b5b60006105c084828501610587565b91505092915050565b600081519050919050565b600082825260208201905092915050565b60005b838110156106035780820151818401526020810190506105e8565b60008484015250505050565b600061061a826105c9565b61062481856105d4565b93506106348185602086016105e5565b61063d8161035f565b840191505092915050565b600060608201905061065d600083018661051e565b61066a60208301856102b5565b818103604083015261067c818461060f565b905094935050505056fea2646970667358221220170cba0ccec0a86cca5f9e47038293f3b558f526edf3582443ba7d7633b1c2de64736f6c63430008180033";

type TippingConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TippingConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Tipping__factory extends ContractFactory {
  constructor(...args: TippingConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      Tipping & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): Tipping__factory {
    return super.connect(runner) as Tipping__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TippingInterface {
    return new Interface(_abi) as TippingInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): Tipping {
    return new Contract(address, _abi, runner) as unknown as Tipping;
  }
}
