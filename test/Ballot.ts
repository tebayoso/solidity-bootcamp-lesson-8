import { expect } from "chai";
import { ethers } from "hardhat";
import { Ballot, Ballot__factory } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.encodeBytes32String(array[index]));
  }
  return bytes32Array;
}

async function deployContract() {
  const signers = await ethers.getSigners();
  const contractFactory = await ethers.getContractFactory("Ballot",);
  const proposals = convertStringArrayToBytes32(PROPOSALS);
  const ballotContract = await contractFactory.deploy(proposals);
  await ballotContract.waitForDeployment();

  return {signers, ballotContract};
}

describe("Ballot", async () => {

  describe("when the contract is deployed", async () => {
    it("has the provided proposals", async () => {
      const {ballotContract} = await loadFixture(deployContract);
      const proposals0 = await ballotContract.proposals(0);
      expect(ethers.decodeBytes32String(proposals0.name)).to.equal(PROPOSALS[0]);
    });

    it("has zero votes for all proposals", async () => {
      const {ballotContract} = await loadFixture(deployContract);
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount).to.equal(0);
      }
    });

    it("sets the deployer address as chairperson", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const deployerAddress = signers[0].address;
      const chairpersonAddress = await ballotContract.chairperson();
      expect(deployerAddress).to.equal(chairpersonAddress);
    });

    it("sets the voting weight for the chairperson as 1", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const chairpersonAddress = await ballotContract.chairperson();
      const chairpersonVoter = await ballotContract.voters(chairpersonAddress);
      expect(chairpersonVoter.weight).to.equal(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("gives right to vote for another address", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const chairpersonAddress = await ballotContract.chairperson();
      const voterAddress = signers[1].address;
      await ballotContract.connect(signers[0]).giveRightToVote(voterAddress);
      const voter = await ballotContract.voters(voterAddress);
      expect(voter.weight).to.equal(1);
    });
    it("can not give right to vote for someone that has voted", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const chairpersonAddress = await ballotContract.chairperson();
      const voterAddress = signers[1].address;
      await ballotContract.connect(signers[0]).giveRightToVote(voterAddress);
      await ballotContract.connect(signers[1]).vote(0);
      await expect(ballotContract.connect(signers[0]).giveRightToVote(voterAddress)).to.be.revertedWith("The voter already voted.");
    });
    it("can not give right to vote for someone that has already voting rights", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const chairpersonAddress = await ballotContract.chairperson();
      const voterAddress = signers[1].address;
      await ballotContract.connect(signers[0]).giveRightToVote(voterAddress);
      await expect(ballotContract.connect(signers[0]).giveRightToVote(voterAddress)).to.be.reverted;
    });
  });

  describe("when the voter interacts with the vote function in the contract", async () => {
    it("should register the vote", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const chairpersonAddress = await ballotContract.chairperson();
      const voterAddress = signers[1].address;
      await ballotContract.connect(signers[0]).giveRightToVote(voterAddress);
      await ballotContract.connect(signers[1]).vote(0);
      const proposal = await ballotContract.proposals(0);
      expect(proposal.voteCount).to.equal(1);
    });
  });

  describe("when the voter interacts with the delegate function in the contract", async () => {
    it("should transfer voting power", async () => {
      it("should transfer voting power", async () => {
        const { signers, ballotContract } = await loadFixture(deployContract);
        const chairpersonAddress = await ballotContract.chairperson();
        const voterAddress = signers[1].address;
        const delegateAddress = signers[2].address;
        await ballotContract.connect(signers[0]).giveRightToVote(voterAddress);

        const initialVoter = await ballotContract.voters(voterAddress);
        expect(initialVoter.weight).to.equal(1);
        const initialDelegate = await ballotContract.voters(delegateAddress);
        expect(initialDelegate.weight).to.equal(0);

        await ballotContract.connect(signers[1]).delegate(delegateAddress);

        const delegate = await ballotContract.voters(delegateAddress);
        expect(delegate.weight).to.equal(1);
      });
    });
  });

  describe("when an account other than the chairperson interacts with the giveRightToVote function in the contract", async () => {
    it("should revert", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const chairpersonAddress = await ballotContract.chairperson();
      const voterAddress = signers[1].address;
      await expect(ballotContract.connect(signers[1]).giveRightToVote(voterAddress)).to.be.revertedWith("Only chairperson can give right to vote.");
    });
  });

  describe("when an account without right to vote interacts with the vote function in the contract", async () => {
    it("should revert", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const chairpersonAddress = await ballotContract.chairperson();
      const voterAddress = signers[1].address;
      await expect(ballotContract.connect(signers[1]).vote(0)).to.be.revertedWith("Has no right to vote");
    });
  });

  describe("when an account without right to vote interacts with the delegate function in the contract", async () => {
    it("should revert", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const chairpersonAddress = await ballotContract.chairperson();
      const voterAddress = signers[1].address;
      const delegateAddress = signers[2].address;
      await expect(ballotContract.connect(signers[1]).delegate(delegateAddress)).to.be.revertedWith("You have no right to vote");
    });
  });

  describe("when someone interacts with the winningProposal function before any votes are cast", async () => {
    it("should return 0", async () => {
      const {ballotContract} = await loadFixture(deployContract);
      const winningProposal = await ballotContract.winningProposal();
      expect(winningProposal).to.equal(0);
    });
  });

  describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", async () => {
    it("should return 0", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const chairpersonAddress = await ballotContract.chairperson();
      const voterAddress = signers[1].address;
      await ballotContract.connect(signers[0]).giveRightToVote(voterAddress);
      await ballotContract.connect(signers[1]).vote(0);
      const winningProposal = await ballotContract.winningProposal();
      expect(winningProposal).to.equal(0);
    });
  });

  describe("when someone interacts with the winnerName function before any votes are cast", async () => {
    it("should return name of proposal 0", async () => {
      const {ballotContract} = await loadFixture(deployContract);
      const winnerName = await ballotContract.winnerName();
      expect(ethers.decodeBytes32String(winnerName)).to.equal(PROPOSALS[0]);
    });
  });

  describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", async () => {
    it("should return name of proposal 0", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const chairpersonAddress = await ballotContract.chairperson();
      const voterAddress = signers[1].address;
      await ballotContract.connect(signers[0]).giveRightToVote(voterAddress);
      await ballotContract.connect(signers[1]).vote(0);
      const winnerName = await ballotContract.winnerName();
      expect(ethers.decodeBytes32String(winnerName)).to.equal(PROPOSALS[0]);
    });
  });

  describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", async () => {
    it("should return the name of the winner proposal", async () => {
      const {signers, ballotContract} = await loadFixture(deployContract);
      const chairpersonAddress = await ballotContract.chairperson();
      const voters = [];
      for (let index = 0; index < 5; index++) {
        const voterAddress = signers[index + 1].address;
        await ballotContract.connect(signers[0]).giveRightToVote(voterAddress);
        voters.push(voterAddress);
      }
    });
  });
});
