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

describe("Payfluence", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const ownerAddress = await owner.getAddress();
    const otherAccountAddress = await otherAccount.getAddress();

    const adminAddress = process.env.ACCOUNT_3_ADDRESS || "";
    const admin = Wallet.fromPrivateKey(Buffer.from((process.env.ACCOUNT_3_PRIVATE_KEY || "").substring(2,66), "hex"));

    const TestERC20 = await hre.ethers.getContractFactory("TestERC20");
    const token: any = await TestERC20.deploy();

    const tokenAddress = await token.getAddress();

    const Payfluence = await hre.ethers.getContractFactory("Payfluence");
    const payfluence: any = await Payfluence.deploy(adminAddress);

    const payfluenceAddress = await payfluence.getAddress();

    return { payfluence, payfluenceAddress, token, tokenAddress, owner, ownerAddress, admin, adminAddress, otherAccount, otherAccountAddress };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { payfluence, ownerAddress } = await loadFixture(deployFixture);

      expect(await payfluence.owner()).to.equal(ownerAddress);
    });
  });

  describe("Funding", function () {
    it("Should fund ERC20 in two steps: approval and transfer, then be able to withdraw", async function () {
      const { payfluence, payfluenceAddress, token, tokenAddress, owner, ownerAddress } = await loadFixture(deployFixture);

      const beforeTransferBalance = await token.balanceOf(ownerAddress);

      const amount = BigInt(1000);
      let txn = await token.connect(owner).approve(payfluenceAddress, amount);
      await txn.wait();

      txn = await payfluence.connect(owner).fundERC20(AIRDROP_ID, ownerAddress, tokenAddress, amount);
      await txn.wait();

      expect(await token.balanceOf(payfluenceAddress)).to.equal(amount);

      // approve amount

      txn = await payfluence.connect(owner).withdrawERC20(AIRDROP_ID, ownerAddress, tokenAddress, amount);
      await txn.wait();

      expect(await token.balanceOf(payfluenceAddress)).to.equal(0);
      expect(await token.balanceOf(ownerAddress)).to.equal(beforeTransferBalance);
    });

    it("Should only allow the airdrop owner to fund additional tokens", async function () {
      const { payfluence, payfluenceAddress, token, tokenAddress, owner, ownerAddress, otherAccount, otherAccountAddress } = await loadFixture(deployFixture);

      const amount = BigInt(1000);

      // send tokens to otherAccount
      let txn = await token.connect(owner).transfer(otherAccountAddress, amount);
      await txn.wait();

      txn = await token.connect(owner).approve(payfluenceAddress, amount);
      await txn.wait();

      txn = await payfluence.connect(owner).fundERC20(AIRDROP_ID, ownerAddress, tokenAddress, amount);
      await txn.wait();

      expect(await token.balanceOf(payfluenceAddress)).to.equal(amount);

      // try funding with otherAccount
      txn = await token.connect(otherAccount).approve(payfluenceAddress, amount);
      await txn.wait();

      txn = payfluence.connect(otherAccount).fundERC20(AIRDROP_ID, otherAccountAddress, tokenAddress, amount);
      await expect(txn).to.be.revertedWithCustomError(payfluence, "OnlyAirdropOwner")
    });

    it("Should only allow the message sender to fund their own tokens", async function () {
      const { payfluence, payfluenceAddress, token, tokenAddress, owner, ownerAddress, otherAccount, otherAccountAddress } = await loadFixture(deployFixture);

      const amount = BigInt(1000);

      // send tokens to otherAccount
      let txn = await token.connect(owner).transfer(otherAccountAddress, amount);
      await txn.wait();

      txn = await token.connect(owner).approve(payfluenceAddress, amount);
      await txn.wait();

      txn = await payfluence.connect(owner).fundERC20(AIRDROP_ID, ownerAddress, tokenAddress, amount);
      await txn.wait();

      expect(await token.balanceOf(payfluenceAddress)).to.equal(amount);

      // try funding on behalf of otherAccount
      txn = await token.connect(otherAccount).approve(payfluenceAddress, amount);
      await txn.wait();

      txn = payfluence.connect(owner).fundERC20(AIRDROP_ID, otherAccountAddress, tokenAddress, amount);
      await expect(txn).to.be.revertedWithCustomError(payfluence, "OnlyTokenOwner")
    });
  });

  describe("Signing", function () {
    it("Should allow the adminAddress to sign a message for recipient", async function () {
      const { payfluence, payfluenceAddress, token, tokenAddress, owner, ownerAddress, admin, adminAddress, otherAccountAddress } = await loadFixture(deployFixture);

      const amount = BigInt(1000);
      let txn = await token.connect(owner).approve(payfluenceAddress, amount);
      await txn.wait();
      txn = await payfluence.connect(owner).fundERC20(AIRDROP_ID, ownerAddress, tokenAddress, amount);
      await txn.wait();
      expect(await token.balanceOf(payfluenceAddress)).to.equal(amount);

      const chainId = Number(await payfluence.getChainId())

      const verifyingContract = payfluenceAddress;
      const airdropMessage: Payfluence.AirdropMessageStruct = {
        airdropId: AIRDROP_ID,
        token: tokenAddress,
        owner: ownerAddress,
        recipient: otherAccountAddress,
        amountClaimable: amount,
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
      const privateKey = Buffer.from((process.env.ACCOUNT_3_PRIVATE_KEY || "").substring(2,66), "hex");

      const signature = signTypedData({
        privateKey,
        data,
        version: SignTypedDataVersion.V4,
      });

      txn = payfluence.connect(owner).verify(signature, airdropMessage);
      await expect(txn).to.not.be.reverted;
    });

    it("Should revert when message is signed by non-admin wallet", async function () {
      const { payfluence, payfluenceAddress, token, tokenAddress, owner, ownerAddress, admin, adminAddress, otherAccountAddress } = await loadFixture(deployFixture);

      const amount = BigInt(1000);
      let txn = await token.connect(owner).approve(payfluenceAddress, amount);
      await txn.wait();
      txn = await payfluence.connect(owner).fundERC20(AIRDROP_ID, ownerAddress, tokenAddress, amount);
      await txn.wait();
      expect(await token.balanceOf(payfluenceAddress)).to.equal(amount);

      const chainId = Number(await payfluence.getChainId())

      const verifyingContract = payfluenceAddress;
      const airdropMessage: Payfluence.AirdropMessageStruct = {
        airdropId: AIRDROP_ID,
        token: tokenAddress,
        owner: ownerAddress,
        recipient: otherAccountAddress,
        amountClaimable: amount,
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
      const privateKey = Buffer.from((process.env.ACCOUNT_4_PRIVATE_KEY || "").substring(2,66), "hex");

      const signature = signTypedData({
        privateKey,
        data,
        version: SignTypedDataVersion.V4,
      });

      txn = payfluence.connect(owner).verify(signature, airdropMessage);
      await expect(txn).to.be.reverted;
    });
  });

});
