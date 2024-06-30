import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, {config, ethers} from "hardhat";
import { Payfluence } from "../typechain-types";
import { default as Wallet } from "ethereumjs-wallet";
import {
  signTypedData,
  SignTypedDataVersion,
  TypedMessage,
} from "@metamask/eth-sig-util";
import dotenv from "dotenv";
dotenv.config();

const AIRDROP_ID = "first-airdrop";

describe("Payfluence Live Sepolia Test", function () {

  describe("Signing", function () {
    it("Should allow the adminAddress to sign a message for recipient", async function () {
      const payfluence = await hre.ethers.getContractAt("Payfluence", "0x26213D9c9C889F5902cA43913cB73186A47B6Ed6");

      const chainId = Number(84532);

      const verifyingContract = "0x26213D9c9C889F5902cA43913cB73186A47B6Ed6";
      const airdropMessage: Payfluence.AirdropMessageStruct = {
        airdropId: "ab2084c9-b4f3-4c1a-9594-e6818dafb8a7",
        amountClaimable: 159,
        owner: "0x9D1aAdE76e340a6a36c8fa9b920f7494A76bb76a",
        recipient: "0x9D1aAdE76e340a6a36c8fa9b920f7494A76bb76a",
        token: "0xf105eaf65ac93a0a45ea79bbdb4d10a1806211fb",
      };

      const data: TypedMessage<any> = {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          AirdropMessage: [
            { name: "airdropId", type: "string" },
            { name: "token", type: "address" },
            { name: "owner", type: "address" },
            { name: "recipient", type: "address" },
            { name: "amountClaimable", type: "uint256" },
          ],
        },
        domain: {
          name: "Payfluence",
          version: "1",
          chainId,
          verifyingContract,
        },
        primaryType: "AirdropMessage",
        message: airdropMessage,
      };

      // 32 bytes private key from owner
      const privateKey = Buffer.from((process.env.DEPLOYER_PRIVATE_KEY || "").substring(2,66), "hex");

      const signature = signTypedData({
        privateKey,
        data,
        version: SignTypedDataVersion.V4,
      });

      console.log("signature", signature);
      console.log(airdropMessage)

      const txn = payfluence.verify(signature, airdropMessage);
      await expect(txn).to.not.be.reverted;
    });
  });

});
