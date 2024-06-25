import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

const AIRDROP_ID = "first-airdrop";

describe("Payfluence", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, admin, otherAccount] = await hre.ethers.getSigners();
    const ownerAddress = await owner.getAddress();
    const adminAddress = await admin.getAddress();

    const TestERC20 = await hre.ethers.getContractFactory("TestERC20");
    const token: any = await TestERC20.deploy();

    const tokenAddress = await token.getAddress();

    const Payfluence = await hre.ethers.getContractFactory("Payfluence");
    const payfluence: any = await Payfluence.deploy(adminAddress);

    const payfluenceAddress = await payfluence.getAddress();

    return { payfluence, payfluenceAddress, token, tokenAddress, owner, ownerAddress, admin, adminAddress, otherAccount };
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
      const approval = await token.connect(owner).approve(payfluenceAddress, amount);
      await approval.wait();

      const transfer = await payfluence.connect(owner).fundERC20(AIRDROP_ID, ownerAddress, tokenAddress, amount);
      await transfer.wait();

      expect(await token.balanceOf(payfluenceAddress)).to.equal(amount);

      // approve amount

      const withdraw = await payfluence.connect(owner).withdrawERC20(AIRDROP_ID, ownerAddress, tokenAddress, amount);
      await withdraw.wait();

      expect(await token.balanceOf(payfluenceAddress)).to.equal(0);
      expect(await token.balanceOf(ownerAddress)).to.equal(beforeTransferBalance);
    });
  });

  describe("Signing", function () {

  });
});
